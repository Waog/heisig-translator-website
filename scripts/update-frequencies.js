const fs = require("fs");
const path = require("path");
const https = require("https");
const unzipper = require("unzipper");
const readline = require("readline");

const subtlexUrl =
  "https://www.ugent.be/pp/experimentele-psychologie/en/research/documents/subtlexch/subtlexch131210.zip";
const zipFilePath = path.join(__dirname, "../subtlexch.zip");
const rawDirPath = path.join(__dirname, "../raw");
const rawFilePath = path.join(rawDirPath, "SUBTLEX_CH_131210_CE.utf8");
const outputFilePath = path.join(__dirname, "../src/assets/subtlexch.json");

// Function to create the raw directory if it doesn't exist
function ensureRawDirExists() {
  if (!fs.existsSync(rawDirPath)) {
    fs.mkdirSync(rawDirPath, { recursive: true });
  }
}

// Function to download the file
function downloadFile(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  https
    .get(url, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close(cb);
      });
    })
    .on("error", (err) => {
      fs.unlink(dest, () => {});
      console.error("Error downloading file:", err.message);
    });
}

// Function to unzip the file
function unzipFile(zipPath, extractPath, cb) {
  fs.createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractPath }))
    .on("close", cb);
}

// Function to parse the SUBTLEX-CH file
function parseSubtlex(filePath) {
  const dictionary = [];
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  rl.on("line", (line) => {
    if (line.startsWith("Word")) return; // Skip the header line

    const [
      Word,
      Length,
      Pinyin,
      PinyinInput,
      WCount,
      Wmillion,
      log10W,
      WCD,
      WCDPercentage,
      log10CD,
      DominantPoS,
      DominantPoSFreq,
      AllPoS,
      AllPoSFreq,
      EngTran,
    ] = line.split("\t");

    dictionary.push({
      Word,
      Length: parseInt(Length, 10),
      Pinyin,
      PinyinInput,
      WCount: parseInt(WCount, 10),
      Wmillion: parseFloat(Wmillion),
      log10W: parseFloat(log10W),
      WCD: parseInt(WCD, 10),
      WCDPercentage: parseFloat(WCDPercentage),
      log10CD: parseFloat(log10CD),
      DominantPoS,
      DominantPoSFreq: parseInt(DominantPoSFreq, 10),
      AllPoS,
      AllPoSFreq: parseInt(AllPoSFreq, 10),
      EngTran: EngTran.replace(/"/g, ""),
    });
  });

  return new Promise((resolve) => {
    rl.on("close", () => {
      resolve(dictionary);
    });
  });
}

// Function to update the SUBTLEX-CH dictionary
function updateSubtlexDictionary() {
  downloadFile(subtlexUrl, zipFilePath, () => {
    console.log("Downloaded SUBTLEX-CH zip file.");

    ensureRawDirExists();

    unzipFile(zipFilePath, rawDirPath, async () => {
      console.log("Unzipped SUBTLEX-CH file.");

      let subtlexDict = await parseSubtlex(rawFilePath);

      // Remove the first entry if its `Word` value contains "Word"
      if (subtlexDict.length > 0 && subtlexDict[0].Word.includes("Word")) {
        subtlexDict.shift();
      }

      fs.writeFileSync(
        outputFilePath,
        JSON.stringify(subtlexDict, null, 2),
        "utf-8"
      );
      console.log(
        `Dictionary has been updated successfully and saved to ${outputFilePath}.`
      );

      // Log an example entry for "你好"
      const exampleEntry = subtlexDict.find((entry) => entry.Word === "你好");
      if (exampleEntry) {
        console.log("Example entry:", JSON.stringify(exampleEntry, null, 2));
      } else {
        console.log('No example entry found for "你好".');
      }

      // Clean up temporary files
      fs.unlinkSync(zipFilePath);
    });
  });
}

updateSubtlexDictionary();
