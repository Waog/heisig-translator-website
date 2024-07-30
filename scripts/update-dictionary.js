const fs = require("fs");
const path = require("path");
const https = require("https");
const unzipper = require("unzipper");

const cedictUrl =
  "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.zip";
const cedictZipPath = path.join(__dirname, "../cedict.zip");
const cedictFilePath = path.join(__dirname, "../cedict_ts.u8");
const outputFilePath = path.join(__dirname, "../src/assets/cedict.json");

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

      // Clean up temporary files
      fs.unlinkSync(cedictZipPath);
      fs.unlinkSync(cedictFilePath);
    });
  });
}

updateDictionary();
