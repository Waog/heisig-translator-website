const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Google Sheets link
const SHEET_ID = "1KF-zNiSrNT-wPsUBnNNGR1eXHsc81T-eYrCpa6X8NaA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// Function to convert header to key
const toKey = (header) => {
  if (typeof header !== "string") {
    return null;
  }
  return header.replace(/[^a-zA-Z0-9]/g, "").replace(/\s+/g, "");
};

// Fetch and process the Google Sheets data
axios
  .get(SHEET_URL)
  .then((response) => {
    const jsonData = JSON.parse(response.data.substr(47).slice(0, -2));
    const table = jsonData.table;

    // Ensure we have at least one row for headers and some data rows
    if (
      !table.cols ||
      !table.rows ||
      table.cols.length === 0 ||
      table.rows.length === 0
    ) {
      throw new Error("Not enough data in the sheet");
    }

    // Process headers from the first row
    const headers = table.cols
      .map((col) => (col && col.label ? toKey(col.label) : null))
      .filter((header) => header);

    // Process rows
    const entries = table.rows.map((row) => {
      const entry = {};
      row.c.forEach((cell, index) => {
        if (headers[index]) {
          entry[headers[index]] = cell ? cell.v : null;
        }
      });
      return entry;
    });

    // Write to heisig.json
    const outputPath = path.join(__dirname, "../src/assets/heisig.json");
    fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2));
    console.log(`Data successfully written to ${outputPath}`);

    // Log an example entry
    if (entries.length > 0) {
      console.log("Example entry:", JSON.stringify(entries[0], null, 2));
    } else {
      console.log("No entries found to display.");
    }
  })
  .catch((error) => {
    console.error("Error fetching or processing data:", error);
  });