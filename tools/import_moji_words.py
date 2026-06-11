import argparse
import csv
import json
import random
import re
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "japanese_words.sqlite3"
EXPORT_DIR = ROOT / "data" / "moji_export"


def clean_meaning(brief: str, excerpt: str) -> str:
    text = (brief or "").strip() or (excerpt or "").strip()
    text = re.sub(r"^\[[^\]]+\]\s*", "", text)
    text = text.replace("；", "；").strip(" 。")
    return text or "未填写释义"


def parse_pos(excerpt: str) -> str:
    match = re.match(r"^\[([^\]]+)\]", excerpt or "")
    if not match:
        return "词语"
    pos = match.group(1)
    pos = pos.replace("自动", "自动词").replace("他动", "他动词")
    return pos


def parse_verb_type(pos: str, spell: str, kana: str) -> str | None:
    raw = f"{pos} {spell} {kana}"
    if "サ变" in raw or "サ変" in raw or "する" in raw and ("名" in raw or spell == "する"):
        return "suru"
    if spell == "来る" or kana == "くる":
        return "kuru"
    if spell == "行く" or kana == "いく":
        return "iku"
    if "一段" in raw:
        return "ichidan"
    if "五段" in raw:
        return "godan"
    return None


def parse_importance(tags: str) -> int:
    tags = tags or ""
    if "N5" in tags:
        return 5
    if "N4" in tags:
        return 4
    if "N3" in tags:
        return 3
    if "N2" in tags:
        return 2
    if "N1" in tags:
        return 2
    return 3


def load_csv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def build_candidates() -> list[dict[str, object]]:
    rows = load_csv(EXPORT_DIR / "folder_words.csv") + load_csv(EXPORT_DIR / "wordlist_words.csv")
    by_key: dict[tuple[str, str], dict[str, object]] = {}
    for row in rows:
        spell = (row.get("spell") or "").strip()
        kana = (row.get("pron") or "").strip()
        if not spell or not kana:
            continue
        key = (spell, kana)
        if key in by_key:
            by_key[key]["source"] = f"{by_key[key]['source']}+moji"
            continue
        pos = parse_pos(row.get("excerpt") or "")
        by_key[key] = {
            "meaning": clean_meaning(row.get("briefInfo") or "", row.get("excerpt") or ""),
            "kana": kana,
            "kanji": spell,
            "pos": pos,
            "verb_type": parse_verb_type(pos, spell, kana),
            "importance": parse_importance(row.get("tags") or ""),
            "example_jp": "",
            "example_meaning": "",
            "moji_word_id": row.get("wordId") or "",
            "moji_tags": row.get("tags") or "",
            "source": "moji",
        }
    return sorted(by_key.values(), key=lambda item: (str(item["kana"]), str(item["kanji"])))


def existing_keys(conn: sqlite3.Connection) -> set[tuple[str, str]]:
    return {
        (row["kanji"], row["kana"])
        for row in conn.execute("SELECT kanji, kana FROM words")
    }


def write_candidates(candidates: list[dict[str, object]]) -> None:
    out_json = EXPORT_DIR / "import_candidates.json"
    out_csv = EXPORT_DIR / "import_candidates.csv"
    out_json.write_text(json.dumps(candidates, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    columns = [
        "kanji",
        "kana",
        "meaning",
        "pos",
        "verb_type",
        "importance",
        "moji_word_id",
        "moji_tags",
        "source",
    ]
    with out_csv.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=columns)
        writer.writeheader()
        for item in candidates:
            writer.writerow({column: item.get(column, "") for column in columns})


def insert_candidates(conn: sqlite3.Connection, candidates: list[dict[str, object]]) -> int:
    keys = existing_keys(conn)
    inserted = 0
    for item in candidates:
        key = (str(item["kanji"]), str(item["kana"]))
        if key in keys:
            continue
        cursor = conn.execute(
            """
            INSERT INTO words
                (meaning, kana, kanji, pos, verb_type, importance, shuffle_rank, example_jp, example_meaning)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                item["meaning"],
                item["kana"],
                item["kanji"],
                item["pos"],
                item["verb_type"],
                item["importance"],
                random.random(),
                item["example_jp"],
                item["example_meaning"],
            ),
        )
        conn.execute("INSERT OR IGNORE INTO progress (word_id, score) VALUES (?, 0)", (cursor.lastrowid,))
        keys.add(key)
        inserted += 1
    return inserted


def main() -> None:
    parser = argparse.ArgumentParser(description="Preview or import readable MOJi words into local app DB.")
    parser.add_argument("--apply", action="store_true", help="Actually insert new words into japanese_words.sqlite3.")
    args = parser.parse_args()

    candidates = build_candidates()
    write_candidates(candidates)

    with sqlite3.connect(DB_PATH) as conn:
      conn.row_factory = sqlite3.Row
      keys = existing_keys(conn)
      new_candidates = [
          item for item in candidates
          if (str(item["kanji"]), str(item["kana"])) not in keys
      ]
      print(f"MOJi candidates: {len(candidates)}")
      print(f"Already in local DB: {len(candidates) - len(new_candidates)}")
      print(f"New words available: {len(new_candidates)}")
      print(f"Candidate files written to: {EXPORT_DIR}")
      if args.apply:
          inserted = insert_candidates(conn, candidates)
          conn.commit()
          print(f"Inserted: {inserted}")
      else:
          print("Dry run only. Add --apply to import.")


if __name__ == "__main__":
    main()
