const fs = require("fs");
const path = require("path");
const https = require("https");
const unzipper = require("unzipper");

const cedictUrl =
  "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.zip";
const rawDirPath = path.join(__dirname, "../raw");
const cedictZipPath = path.join(rawDirPath, "cedict.zip");
const cedictFilePath = path.join(rawDirPath, "cedict_ts.u8");
const outputFilePath = path.join(__dirname, "../src/assets/cedict.json");

// Funktion, um sicherzustellen, dass der "raw" Ordner existiert
function ensureRawDirExists() {
  if (!fs.existsSync(rawDirPath)) {
    fs.mkdirSync(rawDirPath, { recursive: true });
  }
}

function downloadCedict(url, dest, cb) {
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

function parseCedict(filePath) {
  const dictionary = [];
  const lines = fs.readFileSync(filePath, "utf-8").split("\n");

  lines.forEach((line) => {
    if (line.startsWith("#")) return;

    const [traditional, simplified, ...rest] = line.split(" ");
    const pinyin = rest.join(" ").split("[")[1].split("]")[0];
    const english = rest.join(" ").split("/").slice(1, -1);

    dictionary.push({
      traditional,
      simplified,
      pinyin,
      english,
    });
  });

  return dictionary;
}

function unzipCedict(zipPath, extractPath, cb) {
  fs.createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractPath }))
    .on("close", cb);
}

function updateDictionary() {
  ensureRawDirExists();

  downloadCedict(cedictUrl, cedictZipPath, () => {
    console.log("Downloaded CEDICT zip file.");

    unzipCedict(cedictZipPath, path.dirname(cedictFilePath), () => {
      console.log("Unzipped CEDICT file.");

      const cedictDict = parseCedict(cedictFilePath);
      fs.writeFileSync(
        outputFilePath,
        JSON.stringify(cedictDict, null, 2),
        "utf-8"
      );
      console.log("Dictionary has been updated successfully.");
    });
  });
}

updateDictionary();
