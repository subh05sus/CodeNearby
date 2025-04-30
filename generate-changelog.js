/* eslint-disable @typescript-eslint/no-require-imports */
// Simple script to generate a changelog from data in consts/Changelog.ts
const fs = require("fs");
const path = require("path");

// Path fix for importing the Changelog.ts file
console.log("Starting changelog generation...");
console.log("Current directory:", __dirname);

// Manual import of the changelog data since we can't directly require a TypeScript file
const changelogPath = path.join(__dirname, "consts", "Changelog.ts");
console.log(`Reading changelog data from: ${changelogPath}`);

let CHANGELOG = [];
try {
  // Read the file content
  const changelogContent = fs.readFileSync(changelogPath, "utf8");

  // Extract the array data using regex
  const match = changelogContent.match(
    /export const CHANGELOG = (\[[\s\S]*?\]);/
  );
  if (match && match[1]) {
    // Convert the string representation to actual JavaScript object
    // Note: this is a simplified approach and might not work for all cases
    const evalSafe = (str) => {
      // This is a simplified, safer alternative to eval
      return Function('"use strict";return (' + str + ")")();
    };

    try {
      CHANGELOG = evalSafe(match[1]);
      console.log(`Successfully parsed ${CHANGELOG.length} changelog entries`);
    } catch (evalError) {
      console.error("Failed to parse changelog data:", evalError);
    }
  } else {
    console.error("Could not find CHANGELOG array in the file");
  }
} catch (readError) {
  console.error("Error reading changelog file:", readError);
}

// Generate the changelog content
function generateChangelog() {
  // Create header
  let content = `# Changelog\n\nAll notable changes to CodeNearby will be documented in this file.\n\n`;

  // Process each changelog entry
  if (CHANGELOG && CHANGELOG.length) {
    CHANGELOG.forEach((entry) => {
      content += `## [${entry.version}] - ${entry.date}\n`;
      if (entry.beta) {
        content += `> **Beta release**\n\n`;
      } else {
        content += "\n";
      }

      content += "### Changes\n";
      entry.changes.forEach((change) => {
        content += `- ${change}\n`;
      });
      content += "\n";
    });
  } else {
    console.error("ERROR: No changelog data available.");
    return false;
  }

  return content;
}

// Write to file
try {
  const changelogContent = generateChangelog();

  if (changelogContent) {
    const filePath = path.join(__dirname, "CHANGELOG.md");
    console.log(`Writing to file: ${filePath}`);

    fs.writeFileSync(filePath, changelogContent, "utf8");
    console.log("Changelog successfully generated!");
    console.log("---");
    console.log("First 200 characters of changelog:");
    console.log(changelogContent.substring(0, 200));
  }
} catch (error) {
  console.error("Error generating changelog:", error);
}
