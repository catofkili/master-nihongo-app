const fs = require("fs");
const os = require("os");
const path = require("path");
const Realm = require("realm");

const source = process.argv[2] || path.join(process.cwd(), "moji_fav_backup.realm");
const targetClass = process.argv[3] || "";
const limit = Number(process.argv[4] || 10);

if (!fs.existsSync(source)) {
  console.error(`Realm file not found: ${source}`);
  process.exit(2);
}

const workCopy = path.join(
  os.tmpdir(),
  `moji-realm-read-${Date.now()}-${path.basename(source)}`
);
fs.copyFileSync(source, workCopy);

function plain(value) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof ArrayBuffer) {
    const buffer = Buffer.from(value);
    const utf8 = buffer.toString("utf8").replace(/\u0000/g, "");
    return {
      byteLength: buffer.length,
      utf8Preview: utf8.slice(0, 600),
      hexPreview: buffer.toString("hex").slice(0, 240),
    };
  }
  if (typeof value !== "object") return value;
  if (typeof value.toHexString === "function") return value.toHexString();
  if (typeof value.toString === "function" && value.constructor?.name !== "Object") {
    return value.toString();
  }
  return `[${value.constructor?.name || "Object"}]`;
}

let exitCode = 0;

try {
  const realm = new Realm({ path: workCopy });
  const schemas = targetClass
    ? realm.schema.filter((schema) => schema.name === targetClass)
    : realm.schema;

  if (targetClass && schemas.length === 0) {
    console.error(`Class not found: ${targetClass}`);
    console.error(`Available classes: ${realm.schema.map((schema) => schema.name).join(", ")}`);
    exitCode = 3;
  } else {
    for (const schema of schemas) {
      const rows = realm.objects(schema.name);
      const properties = Object.keys(schema.properties);
      console.log(`\n# ${schema.name} (${rows.length})`);
      console.log(`fields: ${properties.join(", ")}`);

      Array.from(rows).slice(0, limit).forEach((row, index) => {
        const item = {};
        for (const property of properties) {
          item[property] = plain(row[property]);
        }
        console.log(`${index + 1}. ${JSON.stringify(item, null, 2)}`);
      });
    }
  }

  realm.close();
} finally {
  try {
    fs.unlinkSync(workCopy);
  } catch {}
}

process.exit(exitCode);
