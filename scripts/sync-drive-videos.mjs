import fs from "node:fs/promises";

const FOLDER_ID = "1FWQYxw_np-4om33BIBuoQK5x3vqh48FX";
const TARGET_FILES = [
  "Taiwan Zouk Festival.html",
  "index.html",
];

function escapeJsString(value) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

async function fetchDriveFiles() {
  const url = `https://drive.google.com/drive/folders/${FOLDER_ID}?usp=sharing`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Drive fetch failed: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const regex = /data-id="([A-Za-z0-9_-]{20,})"[\s\S]{0,1000}?aria-label="([^"]+?) Video Shared"/g;
  const seen = new Set();
  const files = [];

  for (const match of html.matchAll(regex)) {
    const id = match[1];
    const name = match[2];
    if (!/\.(m4v|mp4|mov|avi|mkv|webm)$/i.test(name)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    files.push({ id, name });
  }

  files.sort((a, b) => a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: "base",
  }));

  if (files.length === 0) {
    throw new Error("No public video files found in Google Drive folder.");
  }

  return files;
}

function renderDriveFiles(files) {
  const lines = files.map(({ id, name }) =>
    `  { id: "${escapeJsString(id)}", name: "${escapeJsString(name)}" },`
  );
  return `const DRIVE_FILES = [\n${lines.join("\n")}\n];`;
}

async function updateTargetFile(path, driveFilesBlock) {
  const source = await fs.readFile(path, "utf8");
  const updated = source.replace(
    /const DRIVE_FILES = \[[\s\S]*?\n\];/,
    driveFilesBlock
  );

  if (updated === source && !source.includes("const DRIVE_FILES = [")) {
    throw new Error(`Failed to update DRIVE_FILES block in ${path}`);
  }

  if (updated !== source) {
    await fs.writeFile(path, updated);
  }
}

async function main() {
  const files = await fetchDriveFiles();
  const driveFilesBlock = renderDriveFiles(files);

  for (const path of TARGET_FILES) {
    await updateTargetFile(path, driveFilesBlock);
  }

  console.log(`Synced ${files.length} Drive videos.`);
  for (const file of files) {
    console.log(`${file.name} -> ${file.id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
