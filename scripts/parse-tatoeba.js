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

function parseTatoeba() {
  const sentenceMap = new Map();
  const translationMap = new Map();
  const baseMap = new Map();

  console.log("Parsing sentence base information...");

  // Step 1: Parse sentence base information
  fs.createReadStream(sentencesBaseFilePath)
    .pipe(csv({ separator: "\t", headers: ["id", "base"], skipLines: 0 }))
    .on("data", (row) => {
      let isOriginal;
      let originalId;

      if (row.base === "0") {
        isOriginal = true;
      } else if (row.base === "\\N") {
        isOriginal = null;
      } else {
        isOriginal = false;
        originalId = parseInt(row.base, 10);
      }

      baseMap.set(row.id, { isOriginal, originalId });
    })
    .on("end", () => {
      console.log("Finished parsing sentence base information.");
      parseChineseSentences();
    });

  function parseChineseSentences() {
    console.log("Parsing Chinese sentences...");

    // Step 2: Parse Chinese sentences
    fs.createReadStream(cmnSentencesFilePath)
      .pipe(
        csv({ separator: "\t", headers: ["id", "lang", "text"], skipLines: 0 })
      )
      .on("data", (row) => {
        const baseInfo = baseMap.get(row.id) || {};
        sentenceMap.set(row.id, {
          text: row.text,
          translations: [],
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
            const baseInfo = baseMap.get(row.id) || {};
            translationMap.set(row.id, {
              id: row.id,
              lang,
              text: row.text,
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
        if (sentenceMap.has(row.sentence_id)) {
          const sentence = sentenceMap.get(row.sentence_id);
          const translation = translationMap.get(row.translation_id);

          if (translation) {
            sentence.translations.push({
              id: translation.id,
              lang: translation.lang,
              text: translation.text,
              isOriginal: translation.isOriginal,
              originalId: translation.originalId,
            });
            sentenceMap.set(row.sentence_id, sentence);
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
      const baseInfo = baseMap.get(key);
      if (baseInfo) {
        sentenceMap.set(key, { ...value, ...baseInfo });
      }
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
