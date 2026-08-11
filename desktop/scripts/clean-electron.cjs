const fs = require("node:fs");
const path = require("node:path");

const projectDirectory = path.resolve(__dirname, "..");
const outputDirectory = path.resolve(projectDirectory, "dist-electron");

if (path.dirname(outputDirectory) !== projectDirectory) {
  throw new Error("Refusing to clean an Electron output path outside the Desktop project.");
}

if (fs.existsSync(outputDirectory)) {
  fs.rmSync(outputDirectory, { recursive: true, force: true });
  console.log("Cleaned Electron build output: dist-electron");
}
