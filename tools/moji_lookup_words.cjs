const fs = require("fs");
const os = require("os");
const path = require("path");
const Realm = require("realm");

const corePath = process.argv[2];
const idsPath = process.argv[3];
const outputPath = process.argv[4];

if (!corePath || !idsPath || !outputPath) {
  console.error("Usage: moji_lookup_words.cjs <core.realm> <ids.json> <output.json>");
  process.exit(2);
}

const ids = new Set(JSON.parse(fs.readFileSync(idsPath, "utf8")).map(String));
const workCopy = path.join(os.tmpdir(), `moji-core-lookup-${Date.now()}-${path.basename(corePath)}`);
fs.copyFileSync(corePath, workCopy);

function plain(value) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "object") return value;
  if (typeof value.toHexString === "function") return value.toHexString();
  return String(value);
}

let exitCode = 0;
try {
  const realm = new Realm({ path: workCopy });
  const schema = realm.schema.find((item) => item.name === "Wort");
  if (!schema) throw new Error("Wort schema not found");
  const properties = Object.keys(schema.properties);
  const rows = [];
  for (const row of realm.objects("Wort")) {
    if (!ids.has(String(row.objectId))) continue;
    const item = {};
    for (const property of properties) item[property] = plain(row[property]);
    rows.push(item);
  }
  fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2) + "\n", "utf8");
  console.log(`matched ${rows.length}/${ids.size}`);
  realm.close();
} catch (error) {
  exitCode = 1;
  console.error(error);
} finally {
  try { fs.unlinkSync(workCopy); } catch {}
}

process.exit(exitCode);
