const fs = require("fs");
const path = require("path");
const https = require("https");
const bz2 = require("unbzip2-stream");
const tar = require("tar");

const downloadDir = path.join(__dirname, "../raw/tatoeba");

const urls = [
  "https://downloads.tatoeba.org/exports/per_language/cmn/cmn_sentences.tsv.bz2",
  "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2",
  "https://downloads.tatoeba.org/exports/per_language/deu/deu_sentences.tsv.bz2",
  "https://downloads.tatoeba.org/exports/sentences_base.tar.bz2",
  "https://downloads.tatoeba.org/exports/per_language/cmn/cmn_sentences_CC0.tsv.bz2",
  "https://downloads.tatoeba.org/exports/per_language/deu/deu_sentences_CC0.tsv.bz2",
  "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences_CC0.tsv.bz2",
  "https://downloads.tatoeba.org/exports/links.tar.bz2",
  "https://downloads.tatoeba.org/exports/tags.tar.bz2",
  "https://downloads.tatoeba.org/exports/sentences_with_audio.tar.bz2",
  "https://downloads.tatoeba.org/exports/users_sentences.csv",
];

// Sicherstellen, dass das Download-Verzeichnis existiert
function ensureDownloadDirExists() {
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }
}

// Datei herunterladen
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

// BZ2-Datei herunterladen und entpacken
function downloadAndUnzipBZ2(url, dest, cb) {
  const file = fs.createWriteStream(dest.replace(".bz2", ""));
  https
    .get(url, (response) => {
      response.pipe(bz2()).pipe(file);
      file.on("finish", () => {
        file.close(cb);
      });
    })
    .on("error", (err) => {
      fs.unlink(dest, () => {});
      console.error("Error downloading or unzipping file:", err.message);
    });
}

// TAR.BZ2-Datei herunterladen und entpacken
function downloadAndExtractTarBZ2(url, destDir, cb) {
  https.get(url, (response) => {
    response
      .pipe(bz2())
      .pipe(tar.extract({ cwd: destDir }))
      .on("finish", cb)
      .on("error", (err) => {
        console.error(
          "Error downloading or extracting tar.bz2 file:",
          err.message
        );
      });
  });
}

// Download-Prozess starten
function downloadTatoebaFiles() {
  ensureDownloadDirExists();

  let index = 0;

  function next() {
    if (index >= urls.length) {
      console.log("All files downloaded and extracted successfully.");
      return;
    }

    const url = urls[index];
    const fileName = path.basename(url);
    const dest = path.join(downloadDir, fileName);

    console.log(`Downloading ${fileName}...`);

    if (url.endsWith(".bz2")) {
      if (url.endsWith(".tar.bz2")) {
        downloadAndExtractTarBZ2(url, downloadDir, () => {
          console.log(`Extracted ${fileName}.`);
          index++;
          next();
        });
      } else {
        downloadAndUnzipBZ2(url, dest, () => {
          console.log(`Unzipped ${fileName}.`);
          index++;
          next();
        });
      }
    } else {
      downloadFile(url, dest, () => {
        console.log(`Downloaded ${fileName}.`);
        index++;
        next();
      });
    }
  }

  next();
}

downloadTatoebaFiles();
