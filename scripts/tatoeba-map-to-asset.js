const fs = require("fs");
const path = require("path");

const inputFilePath = path.join(
  __dirname,
  "../raw/tatoeba/tatoeba-linked.json"
);
const outputFilePath = path.join(__dirname, "../src/assets/tatoeba.json");

function mapToAsset() {
  console.log("Loading input JSON...");

  // Load the raw JSON data
  const rawData = fs.readFileSync(inputFilePath, "utf-8");
  const parsedData = JSON.parse(rawData);

  console.log("Filtering and sorting JSON data...");

  // Filter and sort the data
  let filteredAndSortedData = Object.values(parsedData)
    .filter((entry) => {
      const totalReviews =
        entry.reviewPositiveCount +
        entry.reviewNeutralCount +
        entry.reviewNegativeCount;
      const positivePercentage =
        totalReviews > 0 ? entry.reviewPositiveCount / totalReviews : 1;

      // Include only entries with positive review percentage >= 80% or no reviews
      return positivePercentage >= 0.8 || totalReviews === 0;
    })
    .sort((a, b) => {
      // Primary sorting by isOriginal (treating null and false as the same category)
      if (a.isOriginal === true && b.isOriginal !== true) return -1;
      if (a.isOriginal !== true && b.isOriginal === true) return 1;

      // Secondary sorting by presence of English translation
      const aHasEnglish = a.translations.some((t) => t.lang === "eng");
      const bHasEnglish = b.translations.some((t) => t.lang === "eng");
      if (aHasEnglish && !bHasEnglish) return -1;
      if (!aHasEnglish && bHasEnglish) return 1;

      // Tertiary sorting by review quality
      const aReviewTotal =
        a.reviewPositiveCount + a.reviewNeutralCount + a.reviewNegativeCount;
      const bReviewTotal =
        b.reviewPositiveCount + b.reviewNeutralCount + b.reviewNegativeCount;

      const aReviewRatio =
        aReviewTotal > 1
          ? (a.reviewPositiveCount + 1) / (a.reviewNegativeCount + 1)
          : 0;
      const bReviewRatio =
        bReviewTotal > 1
          ? (b.reviewPositiveCount + 1) / (b.reviewNegativeCount + 1)
          : 0;

      if (aReviewTotal > 1 && bReviewTotal <= 1) return -1;
      if (aReviewTotal <= 1 && bReviewTotal > 1) return 1;
      if (aReviewRatio > bReviewRatio) return -1;
      if (aReviewRatio < bReviewRatio) return 1;

      // Quaternary sorting by presence of audioId
      if (a.audioId && !b.audioId) return -1;
      if (!a.audioId && b.audioId) return 1;

      return 0;
    });

  console.log("Stripping unnecessary properties...");

  // Strip out unnecessary properties
  filteredAndSortedData = filteredAndSortedData.map((entry) => {
    // Remove properties from the top-level element
    const {
      tags,
      reviewPositiveCount,
      reviewNeutralCount,
      reviewNegativeCount,
      isOriginal,
      originalId,
      audioId,
      ...strippedEntry
    } = entry;

    // Only keep isOriginal if true
    if (isOriginal !== true) delete strippedEntry.isOriginal;

    // Only keep audioId if not null
    if (audioId === null) delete strippedEntry.audioId;

    // Strip out unnecessary properties from each translation
    strippedEntry.translations = strippedEntry.translations.map(
      (translation) => {
        const {
          id,
          tags,
          reviewPositiveCount,
          reviewNeutralCount,
          reviewNegativeCount,
          isOriginal,
          originalId,
          audioId,
          ...strippedTranslation
        } = translation;

        // Only keep audioId if not null
        if (audioId === null) delete strippedTranslation.audioId;

        return strippedTranslation;
      }
    );

    return strippedEntry;
  });

  console.log("Saving output JSON...");

  // Save the transformed JSON as an array
  fs.writeFileSync(
    outputFilePath,
    JSON.stringify(filteredAndSortedData, null, 2),
    "utf-8"
  );

  console.log(`JSON output saved to ${outputFilePath}`);
}

mapToAsset();
