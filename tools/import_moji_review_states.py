import argparse
import hashlib
import json
import random
import re
import shutil
import sqlite3
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "japanese_words.sqlite3"
CLOUD_DIR = ROOT / "data" / "moji_export" / "cloud"
REVIEWS_PATH = CLOUD_DIR / "teststates_list.json"
FALLBACK_REVIEWS_PATH = CLOUD_DIR / "test_reviews_all_scores.json"
WORDS_PATHS = [
    CLOUD_DIR / "review_words.json",
    CLOUD_DIR / "teststates_detail_words.json",
    CLOUD_DIR / "fetched_missing_words.json",
]
FAV_WORDS_PATH = ROOT / "data" / "moji_export" / "words.json"


def clean_meaning(brief: str | None, excerpt: str | None) -> str:
    text = (brief or "").strip() or (excerpt or "").strip()
    text = re.sub(r"^\[[^\]]+\]\s*", "", text)
    return text.strip(" 。") or "未填写释义"


def parse_pos(excerpt: str | None) -> str:
    match = re.match(r"^\[([^\]]+)\]", excerpt or "")
    return match.group(1) if match else "词语"


def parse_verb_type(pos: str, spell: str, kana: str) -> str | None:
    raw = f"{pos} {spell} {kana}"
    if "サ变" in raw or "サ変" in raw or spell == "する":
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


def importance(tags: str | None) -> int:
    tags = tags or ""
    if "N5" in tags:
        return 5
    if "N4" in tags:
        return 4
    if "N3" in tags:
        return 3
    return 2 if ("N2" in tags or "N1" in tags) else 3


def stable_jitter(text: str, span: int) -> int:
    if span <= 0:
        return 0
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return int(digest[:8], 16) % (span + 1)


def local_score(review: dict) -> float:
    raw_score = max(float(review.get("score") or 0), 0)
    if raw_score < 100:
        return raw_score / 10

    target_id = str(review.get("targetId") or review.get("objectId") or "")
    return 8 + stable_jitter(target_id, 27)


def read_json_rows(path: Path) -> list[dict]:
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return [row for row in data if isinstance(row, dict)]
    if isinstance(data, dict):
        rows: list[dict] = []
        for value in data.values():
            if isinstance(value, list):
                rows.extend(row for row in value if isinstance(row, dict))
            elif isinstance(value, dict):
                rows.append(value)
        return rows
    return []


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--overwrite-active", action="store_true", help="Also update words already practiced locally.")
    args = parser.parse_args()

    reviews_path = REVIEWS_PATH if REVIEWS_PATH.exists() else FALLBACK_REVIEWS_PATH
    reviews = read_json_rows(reviews_path)
    words = []
    for path in WORDS_PATHS:
        words.extend(read_json_rows(path))
    fav_words = read_json_rows(FAV_WORDS_PATH)
    review_by_id = {str(row["targetId"]): row for row in reviews if row.get("targetId")}
    word_by_id = {str(row["objectId"]): row for row in words if row.get("objectId")}
    word_by_id.update({str(row["objectId"]): row for row in fav_words if row.get("objectId") and str(row["objectId"]) not in word_by_id})
    matched_ids = sorted(set(review_by_id) & set(word_by_id))
    missing_ids = sorted(set(review_by_id) - set(word_by_id))

    report = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "reviews": len(reviews),
        "matchedWords": len(matched_ids),
        "missingWords": len(missing_ids),
        "missingIds": missing_ids,
        "apply": args.apply,
        "insertedWords": 0,
        "updatedProgress": 0,
        "skippedActiveLocalProgress": 0,
    }

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        existing = {
            (row["kanji"], row["kana"]): row
            for row in conn.execute("SELECT id, kanji, kana FROM words")
        }

        operations = []
        for word_id in matched_ids:
            word = word_by_id[word_id]
            review = review_by_id[word_id]
            kanji = (word.get("spell") or "").strip()
            kana = (word.get("pron") or "").strip()
            if not kanji or not kana:
                continue
            pos = parse_pos(word.get("excerpt"))
            item = {
                "mojiWordId": word_id,
                "kanji": kanji,
                "kana": kana,
                "meaning": clean_meaning(word.get("briefInfo"), word.get("excerpt")),
                "pos": pos,
                "verb_type": parse_verb_type(pos, kanji, kana),
                "importance": importance(word.get("tags")),
                "local_score": local_score(review),
                "moji_score": review.get("score"),
                "qCnt": review.get("qCnt") or 0,
                "qWrCnt": review.get("qWrCnt") or 0,
                "isRight": review.get("isRight"),
                "testTimes": review.get("testTimes") or 0,
            }
            operations.append(item)

        preview_path = CLOUD_DIR / "review_import_preview.json"
        preview_path.write_text(json.dumps(operations, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"review rows: {len(reviews)}")
        print(f"matched words: {len(operations)}")
        print(f"missing words: {len(missing_ids)}")
        print(f"preview: {preview_path}")

        if not args.apply:
            print("Dry run only. Add --apply to import.")
            return

        backup = ROOT / f"japanese_words.before_moji_review_import.{datetime.now().strftime('%Y%m%d-%H%M%S')}.sqlite3"
        shutil.copy2(DB_PATH, backup)
        print(f"backup: {backup}")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS moji_migrated_reviews (
                word_id INTEGER PRIMARY KEY,
                imported_on TEXT NOT NULL,
                priority REAL NOT NULL DEFAULT 0,
                activated_on TEXT,
                FOREIGN KEY(word_id) REFERENCES words(id)
            )
            """
        )

        for item in operations:
            key = (item["kanji"], item["kana"])
            row = existing.get(key)
            if row:
                word_pk = row["id"]
            else:
                cursor = conn.execute(
                    """
                    INSERT INTO words
                        (meaning, kana, kanji, pos, verb_type, importance, shuffle_rank, example_jp, example_meaning)
                    VALUES (?, ?, ?, ?, ?, ?, ?, '', '')
                    """,
                    (
                        item["meaning"],
                        item["kana"],
                        item["kanji"],
                        item["pos"],
                        item["verb_type"],
                        item["importance"],
                        random.random(),
                    ),
                )
                word_pk = cursor.lastrowid
                existing[key] = {"id": word_pk, "kanji": item["kanji"], "kana": item["kana"]}
                report["insertedWords"] += 1

            progress = conn.execute(
                "SELECT score, seen_count, known_forever FROM progress WHERE word_id = ?",
                (word_pk,),
            ).fetchone()
            active_local = progress and (progress["seen_count"] > 0 or progress["known_forever"])
            if active_local and not args.overwrite_active:
                report["skippedActiveLocalProgress"] += 1
                continue

            conn.execute(
                """
                INSERT INTO progress
                    (word_id, score, seen_count, right_count, fuzzy_count, forgot_count, low_history, last_decay_amount)
                VALUES (?, ?, ?, ?, 0, ?, ?, 10)
                ON CONFLICT(word_id) DO UPDATE SET
                    score = excluded.score,
                    seen_count = MAX(progress.seen_count, excluded.seen_count),
                    right_count = MAX(progress.right_count, excluded.right_count),
                    forgot_count = MAX(progress.forgot_count, excluded.forgot_count),
                    low_history = MAX(progress.low_history, excluded.low_history)
                """,
                (
                    word_pk,
                    item["local_score"],
                    max(int(item["qCnt"]), 1),
                    max(int(item["qCnt"]) - int(item["qWrCnt"]), 0),
                    int(item["qWrCnt"]),
                    1 if item["local_score"] <= 6 else 0,
                ),
            )
            priority = (
                int(item["qWrCnt"]) * 20
                + max(6 - float(item["local_score"]), 0) * 10
                + int(item["qCnt"]) * 2
                + int(item["testTimes"] or 0)
                + int(item["importance"])
            )
            conn.execute(
                """
                INSERT INTO moji_migrated_reviews (word_id, imported_on, priority)
                VALUES (?, date('now', 'localtime'), ?)
                ON CONFLICT(word_id) DO UPDATE SET
                    priority = MAX(moji_migrated_reviews.priority, excluded.priority)
                """,
                (word_pk, priority),
            )
            report["updatedProgress"] += 1

        conn.commit()

    report_path = CLOUD_DIR / "review_import_report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
