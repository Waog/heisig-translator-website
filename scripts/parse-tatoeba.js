const fs = require("fs");
const path = require("path");
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

function parseTatoeba() {
  const sentenceMap = new Map();
  const translationMap = new Map();
  const baseMap = new Map();
  const audioMap = new Map();

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
        parseChineseSentences();
      });
  }

  function parseChineseSentences() {
    console.log("Parsing Chinese sentences...");

    // Step 3: Parse Chinese sentences
    fs.createReadStream(cmnSentencesFilePath)
      .pipe(
        csv({ separator: "\t", headers: ["id", "lang", "text"], skipLines: 0 })
      )
      .on("data", (row) => {
        const sentenceId = parseInt(row.id, 10);
        const baseInfo = baseMap.get(sentenceId) || {
          isOriginal: null,
          originalId: null,
        };
        const audioId = audioMap.get(sentenceId) || null;
        sentenceMap.set(sentenceId, {
          text: row.text,
          translations: [],
          audioId,
          ...baseInfo,
        });
      })
      .on("end", () => {
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
        fs.createReadStream(filePath)
          .pipe(
            csv({
              separator: "\t",
              headers: ["id", "lang", "text"],
              skipLines: 0,
            })
          )
          .on("data", (row) => {
            const translationId = parseInt(row.id, 10);
            const baseInfo = baseMap.get(translationId) || {
              isOriginal: null,
              originalId: null,
            };
            const audioId = audioMap.get(translationId) || null;
            translationMap.set(translationId, {
              id: translationId,
              lang,
              text: row.text,
              audioId,
              ...baseInfo,
            });
          })
          .on("end", resolve)
          .on("error", reject);
      });
    };

    Promise.all([
      parseTranslationFile(engSentencesFilePath, "eng"),
      parseTranslationFile(deuSentencesFilePath, "deu"),
      parseTranslationFile(cmnSentencesFilePath, "cmn"), // Including Chinese translations
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
      sentenceMap.set(key, { ...value, ...baseInfo, audioId });
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
