const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const root = path.join(process.cwd(), "src");
const broken = /[ÂÃØÙ]/;
const brokenGlobal = /[ÂÃØÙ]/g;
const arabicGlobal = /[؀-ۿ]/g;
const cp1252 = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

function decodeOnce(value) {
  const bytes = [];
  for (const char of value) {
    const point = char.codePointAt(0);
    const byte = cp1252[point] ?? point;
    if (byte > 255) return value;
    bytes.push(byte);
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(
      Uint8Array.from(bytes),
    );
  } catch {
    return value;
  }
}

function score(value) {
  return (
    (value.match(arabicGlobal) || []).length * 4 -
    (value.match(brokenGlobal) || []).length * 8
  );
}

function repair(value) {
  if (!broken.test(value)) return value;
  let current = value;
  for (let pass = 0; pass < 3; pass += 1) {
    const decoded = decodeOnce(current);
    if (decoded === current || score(decoded) <= score(current)) break;
    current = decoded;
  }
  return current;
}

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return /\.tsx?$/.test(entry.name) ? [target] : [];
  });
}

for (const file of sourceFiles(root)) {
  const text = fs.readFileSync(file, "utf8");
  if (!broken.test(text)) continue;
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const edits = [];
  function add(start, end) {
    const value = text.slice(start, end);
    const fixed = repair(value);
    if (fixed !== value) edits.push({ start, end, fixed });
  }
  function visit(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
      add(node.getStart(source) + 1, node.getEnd() - 1);
    else if (ts.isJsxText(node)) add(node.getStart(source), node.getEnd());
    else if (ts.isTemplateHead(node))
      add(node.getStart(source) + 1, node.getEnd() - 2);
    else if (ts.isTemplateMiddle(node))
      add(node.getStart(source) + 1, node.getEnd() - 2);
    else if (ts.isTemplateTail(node))
      add(node.getStart(source) + 1, node.getEnd() - 1);
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (!edits.length) continue;
  let output = text;
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.fixed + output.slice(edit.end);
  fs.writeFileSync(file, output, "utf8");
  process.stdout.write(`${path.relative(process.cwd(), file)}\n`);
}
