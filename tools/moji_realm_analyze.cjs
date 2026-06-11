const fs = require("fs");
const os = require("os");
const path = require("path");
const Realm = require("realm");

const source = process.argv[2] || path.join(process.cwd(), "moji_fav_backup.realm");
const outputDir = process.argv[3] || path.join(process.cwd(), "data", "moji_export");
const coreSource = process.argv[4] || "";

if (!fs.existsSync(source)) {
  console.error(`Realm file not found: ${source}`);
  process.exit(2);
}

fs.mkdirSync(outputDir, { recursive: true });

const workCopy = path.join(
  os.tmpdir(),
  `moji-realm-analyze-${Date.now()}-${path.basename(source)}`
);
fs.copyFileSync(source, workCopy);
let coreWorkCopy = "";
if (coreSource) {
  if (!fs.existsSync(coreSource)) {
    console.error(`Core Realm file not found: ${coreSource}`);
    process.exit(2);
  }
  coreWorkCopy = path.join(
    os.tmpdir(),
    `moji-core-realm-analyze-${Date.now()}-${path.basename(coreSource)}`
  );
  fs.copyFileSync(coreSource, coreWorkCopy);
}

function valueOf(value) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof ArrayBuffer) {
    const text = Buffer.from(value).toString("utf8").replace(/\u0000/g, "").trim();
    if (!text) return "";
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  if (typeof value !== "object") return value;
  if (typeof value.toHexString === "function") return value.toHexString();
  return String(value);
}

function rowsFor(realm, className) {
  const schema = realm.schema.find((item) => item.name === className);
  if (!schema) return [];
  const properties = Object.keys(schema.properties);
  return Array.from(realm.objects(className)).map((row) => {
    const item = {};
    for (const property of properties) {
      item[property] = valueOf(row[property]);
    }
    return item;
  });
}

function writeJson(fileName, data) {
  fs.writeFileSync(
    path.join(outputDir, fileName),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8"
  );
}

function csvCell(value) {
  const text = value === null || value === undefined
    ? ""
    : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function writeCsv(fileName, rows, columns) {
  const lines = [columns.map(csvCell).join(",")];
  for (const row of rows) {
    lines.push(columns.map((column) => csvCell(row[column])).join(","));
  }
  fs.writeFileSync(path.join(outputDir, fileName), `${lines.join("\n")}\n`, "utf8");
}

let exitCode = 0;

try {
  const realm = new Realm({ path: workCopy });
  const coreRealm = coreWorkCopy ? new Realm({ path: coreWorkCopy }) : null;
  const classCounts = Object.fromEntries(
    realm.schema.map((schema) => [schema.name, realm.objects(schema.name).length])
  );

  const words = rowsFor(realm, "Wort");
  const coreWords = coreRealm ? rowsFor(coreRealm, "Wort") : [];
  const folders = rowsFor(realm, "Folder");
  const folderItems = rowsFor(realm, "ItemInFolder");
  const wordListPlayItems = rowsFor(realm, "DB_WordListPlayItem");
  const usage = rowsFor(realm, "DB_UsageRecord");
  const wordById = new Map(words.map((word) => [word.objectId, word]));
  const coreWordById = new Map(coreWords.map((word) => [word.objectId, word]));
  const folderById = new Map(folders.map((folder) => [folder.objectId, folder]));

  const folderWords = folderItems.map((item) => {
    const word = wordById.get(item.targetId) || coreWordById.get(item.targetId) || {};
    const folder = folderById.get(item.parentFolderId) || {};
    return {
      folderId: item.parentFolderId,
      folderTitle: folder.title || item.parentFolderId,
      wordId: item.targetId,
      title: item.title,
      spell: word.spell || "",
      pron: word.pron || "",
      briefInfo: word.briefInfo || "",
      excerpt: word.excerpt || "",
      tags: word.tags || "",
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });

  const wordListWords = wordListPlayItems.map((item) => {
    const wordId = item.wordId || item.targetId;
    const word = wordById.get(wordId) || coreWordById.get(wordId) || {};
    return {
      listId: item.parentFolderId,
      wordId,
      title: item.title,
      spell: word.spell || item.title || "",
      pron: word.pron || "",
      briefInfo: word.briefInfo || "",
      excerpt: word.excerpt || "",
      tags: word.tags || "",
      exampleId: item.exampleId || "",
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });

  const metadataSummary = {};
  const metadataSamples = {};
  for (const record of usage) {
    const metadata = record.metadata;
    const key = metadata && typeof metadata === "object"
      ? Object.keys(metadata).sort().join("+")
      : typeof metadata;
    metadataSummary[key] = (metadataSummary[key] || 0) + 1;
    if (!metadataSamples[key]) {
      metadataSamples[key] = {
        recordType: record.recordType,
        startAt: record.startAt,
        endAt: record.endAt,
        metadata,
      };
    }
  }

  const report = {
    source,
    coreSource: coreSource || null,
    generatedAt: new Date().toISOString(),
    classCounts,
    folders: folders.map((folder) => ({
      objectId: folder.objectId,
      title: folder.title,
      itemsNum: folder.itemsNum,
      wordsNum: folder.wordsNum,
      type: folder.type,
    })),
    totals: {
      words: words.length,
      coreWords: coreWords.length,
      folderItems: folderItems.length,
      wordListPlayItems: wordListPlayItems.length,
      usageRecords: usage.length,
      resolvedFolderWords: folderWords.filter((word) => word.spell).length,
      resolvedWordListWords: wordListWords.filter((word) => word.spell).length,
    },
    metadataSummary,
    metadataSamples,
  };

  writeJson("report.json", report);
  writeJson("words.json", words);
  writeJson("folder_words.json", folderWords);
  writeJson("wordlist_words.json", wordListWords);
  writeCsv("folder_words.csv", folderWords, [
    "folderTitle",
    "wordId",
    "title",
    "spell",
    "pron",
    "briefInfo",
    "excerpt",
    "tags",
    "createdAt",
    "updatedAt",
  ]);
  writeCsv("wordlist_words.csv", wordListWords, [
    "listId",
    "wordId",
    "title",
    "spell",
    "pron",
    "briefInfo",
    "excerpt",
    "tags",
    "exampleId",
    "createdAt",
    "updatedAt",
  ]);
  writeCsv("words.csv", words, [
    "objectId",
    "spell",
    "pron",
    "briefInfo",
    "excerpt",
    "tags",
    "accent",
    "createdAt",
    "updatedAt",
  ]);

  realm.close();
  if (coreRealm) coreRealm.close();
  console.log(`Wrote MOJi export to ${outputDir}`);
  console.log(`Words: ${words.length}`);
  if (coreWords.length) console.log(`Core words: ${coreWords.length}`);
  console.log(`Folder items: ${folderItems.length}`);
  console.log(`Resolved folder words: ${folderWords.filter((word) => word.spell).length}`);
  console.log(`Word list play items: ${wordListPlayItems.length}`);
  console.log(`Resolved word list words: ${wordListWords.filter((word) => word.spell).length}`);
  console.log(`Usage metadata kinds: ${Object.keys(metadataSummary).length}`);
} catch (error) {
  exitCode = 1;
  console.error(error);
} finally {
  try {
    fs.unlinkSync(workCopy);
  } catch {}
  if (coreWorkCopy) {
    try {
      fs.unlinkSync(coreWorkCopy);
    } catch {}
  }
}

process.exit(exitCode);
