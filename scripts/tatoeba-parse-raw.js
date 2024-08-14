const fs = require("fs");
const path = require("path");
const readline = require("readline");
const csv = require("csv-parser");

const downloadDir = path.join(__dirname, "../raw/tatoeba");
const outputFilePath = path.join(downloadDir, "tatoeba-linked.json");

const cmnSentencesFilePath = path.join(downloadDir, "cmn_sentences.tsv");
const engSentencesFilePath = path.join(downloadDir, "eng_sentences.tsv");
const deuSentencesFilePath = path.join(downloadDir, "deu_sentences.tsv");
const linksFilePath = path.join(downloadDir, "links.csv");
const sentencesBaseFilePath = path.join(downloadDir, "sentences_base.csv");
const sentencesWithAudioFilePath = path.join(
  downloadDir,
  "sentences_with_audio.csv"
);
const tagsFilePath = path.join(downloadDir, "tags.csv");
const usersSentencesFilePath = path.join(downloadDir, "users_sentences.csv");

function parseTatoeba() {
  const sentenceMap = new Map();
  const translationMap = new Map();
  const baseMap = new Map();
  const audioMap = new Map();
  const tagsMap = new Map();
  const reviewMap = new Map();

  console.log("Parsing sentence base information...");

  // Step 1: Parse sentence base information
  fs.createReadStream(sentencesBaseFilePath)
    .pipe(csv({ separator: "\t", headers: ["id", "base"], skipLines: 0 }))
    .on("data", (row) => {
      const sentenceId = parseInt(row.id, 10);
      let isOriginal = null;
      let originalId = null;

      if (row.base === "0") {
        isOriginal = true;
      } else if (row.base !== "\\N") {
        isOriginal = false;
        originalId = parseInt(row.base, 10);
      }

      baseMap.set(sentenceId, { isOriginal, originalId });
    })
    .on("end", () => {
      console.log("Finished parsing sentence base information.");
      parseAudioInformation();
    });

  // Step 2: Parse audio information
  function parseAudioInformation() {
    console.log("Parsing audio information...");

    fs.createReadStream(sentencesWithAudioFilePath)
      .pipe(
        csv({
          separator: "\t",
          headers: [
            "sentence_id",
            "audio_id",
            "username",
            "license",
            "attribution_url",
          ],
          skipLines: 0,
        })
      )
      .on("data", (row) => {
        const sentenceId = parseInt(row.sentence_id, 10);
        const audioId = parseInt(row.audio_id, 10);
        audioMap.set(sentenceId, audioId);
      })
      .on("end", () => {
        console.log("Finished parsing audio information.");
        parseTags();
      });
  }

  // Step 3: Parse tags information
  function parseTags() {
    console.log("Parsing tags information...");

    fs.createReadStream(tagsFilePath)
      .pipe(
        csv({ separator: "\t", headers: ["sentence_id", "tag"], skipLines: 0 })
      )
      .on("data", (row) => {
        const sentenceId = parseInt(row.sentence_id, 10);
        if (!tagsMap.has(sentenceId)) {
          tagsMap.set(sentenceId, []);
        }
        tagsMap.get(sentenceId).push(row.tag);
      })
      .on("end", () => {
        console.log("Finished parsing tags information.");
        parseReviews();
      });
  }

  // Step 4: Parse users' reviews
  function parseReviews() {
    console.log("Parsing users' reviews...");

    fs.createReadStream(usersSentencesFilePath)
      .pipe(
        csv({
          separator: "\t",
          headers: [
            "username",
            "sentence_id",
            "review",
            "date_added",
            "date_modified",
          ],
          skipLines: 0,
        })
      )
      .on("data", (row) => {
        const sentenceId = parseInt(row.sentence_id, 10);
        const review = parseInt(row.review, 10);

        if (!reviewMap.has(sentenceId)) {
          reviewMap.set(sentenceId, {
            reviewPositiveCount: 0,
            reviewNeutralCount: 0,
            reviewNegativeCount: 0,
          });
        }

        const reviewData = reviewMap.get(sentenceId);
        if (review === 1) {
          reviewData.reviewPositiveCount += 1;
        } else if (review === 0) {
          reviewData.reviewNeutralCount += 1;
        } else if (review === -1) {
          reviewData.reviewNegativeCount += 1;
        }

        reviewMap.set(sentenceId, reviewData);
      })
      .on("end", () => {
        console.log("Finished parsing users' reviews.");
        parseChineseSentences();
      });
  }

  function parseChineseSentences() {
    console.log("Parsing Chinese sentences...");

    const lineReader = readline.createInterface({
      input: fs.createReadStream(cmnSentencesFilePath),
      output: process.stdout,
      terminal: false,
    });

    lineReader.on("line", (line) => {
      // Properly handle special characters in the TSV by splitting with regex to handle potential tab or newline within the sentence.
      const [id, lang, ...textArray] = line.split(/\t+/);
      const text = textArray.join(" ").trim();
      const sentenceId = parseInt(id, 10);

      const baseInfo = baseMap.get(sentenceId) || {
        isOriginal: null,
        originalId: null,
      };
      const audioId = audioMap.get(sentenceId) || null;
      const tags = tagsMap.get(sentenceId) || [];
      const reviews = reviewMap.get(sentenceId) || {
        reviewPositiveCount: 0,
        reviewNeutralCount: 0,
        reviewNegativeCount: 0,
      };

      sentenceMap.set(sentenceId, {
        text,
        translations: [],
        audioId,
        tags,
        ...reviews,
        ...baseInfo,
      });
    });

    lineReader.on("close", () => {
      console.log("Finished parsing Chinese sentences.");
      parseTranslations();
    });
  }

  function parseTranslations() {
    console.log(
      "Parsing English, German, and additional Chinese translations..."
    );

    const parseTranslationFile = (filePath, lang) => {
      return new Promise((resolve, reject) => {
        const lineReader = readline.createInterface({
          input: fs.createReadStream(filePath),
          output: process.stdout,
          terminal: false,
        });

        lineReader.on("line", (line) => {
          const [id, lang, ...textArray] = line.split(/\t+/);
          const text = textArray.join(" ").trim();
          const translationId = parseInt(id, 10);

          const baseInfo = baseMap.get(translationId) || {
            isOriginal: null,
            originalId: null,
          };
          const audioId = audioMap.get(translationId) || null;
          const tags = tagsMap.get(translationId) || [];
          const reviews = reviewMap.get(translationId) || {
            reviewPositiveCount: 0,
            reviewNeutralCount: 0,
            reviewNegativeCount: 0,
          };

          translationMap.set(translationId, {
            id: translationId,
            lang,
            text,
            audioId,
            tags,
            ...reviews,
            ...baseInfo,
          });
        });

        lineReader.on("close", resolve);
        lineReader.on("error", reject);
      });
    };

    Promise.all([
      parseTranslationFile(engSentencesFilePath, "eng"),
      parseTranslationFile(deuSentencesFilePath, "deu"),
      parseTranslationFile(cmnSentencesFilePath, "cmn"),
    ])
      .then(() => {
        console.log("Finished parsing translations.");
        parseLinks();
      })
      .catch((err) => {
        console.error("Error parsing translations:", err.message);
      });
  }

  function parseLinks() {
    console.log("Parsing links...");

    fs.createReadStream(linksFilePath)
      .pipe(
        csv({ separator: "\t", headers: ["sentence_id", "translation_id"] })
      )
      .on("data", (row) => {
        const sentenceId = parseInt(row.sentence_id, 10);
        const translationId = parseInt(row.translation_id, 10);

        if (sentenceMap.has(sentenceId)) {
          const sentence = sentenceMap.get(sentenceId);
          const translation = translationMap.get(translationId);

          if (translation) {
            sentence.translations.push({
              id: translation.id,
              lang: translation.lang,
              text: translation.text,
              audioId: translation.audioId,
              tags: translation.tags,
              reviewPositiveCount: translation.reviewPositiveCount,
              reviewNeutralCount: translation.reviewNeutralCount,
              reviewNegativeCount: translation.reviewNegativeCount,
              isOriginal: translation.isOriginal,
              originalId: translation.originalId,
            });
            sentenceMap.set(sentenceId, sentence);
          }
        }
      })
      .on("end", () => {
        console.log("Finished parsing links.");
        saveJSON();
      })
      .on("error", (err) => {
        console.error("Error parsing links:", err.message);
      });
  }

  function saveJSON() {
    // Add base info to top-level sentence entries
    sentenceMap.forEach((value, key) => {
      const baseInfo = baseMap.get(key) || {
        isOriginal: null,
        originalId: null,
      };
      const audioId = audioMap.get(key) || null;
      const tags = tagsMap.get(key) || [];
      const reviews = reviewMap.get(key) || {
        reviewPositiveCount: 0,
        reviewNeutralCount: 0,
        reviewNegativeCount: 0,
      };
      sentenceMap.set(key, {
        ...value,
        ...baseInfo,
        audioId,
        tags,
        ...reviews,
      });
    });

    fs.writeFileSync(
      outputFilePath,
      JSON.stringify(Object.fromEntries(sentenceMap), null, 2),
      "utf-8"
    );
    console.log(`JSON output saved to ${outputFilePath}`);
  }
}

parseTatoeba();
