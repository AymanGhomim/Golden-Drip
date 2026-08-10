const fs = require("node:fs");
const path = require("node:path");

const nextDirectory = path.join(process.cwd(), ".next");
if (fs.existsSync(nextDirectory)) {
  fs.rmSync(nextDirectory, { recursive: true, force: true });
  console.log("Cleaned Next.js build cache: .next");
}
