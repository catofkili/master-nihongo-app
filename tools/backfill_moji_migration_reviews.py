import argparse
import json
import sqlite3
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "japanese_words.sqlite3"
PREVIEW_PATH = ROOT / "data" / "moji_export" / "cloud" / "review_import_preview.json"
REPORT_PATH = ROOT / "data" / "moji_export" / "cloud" / "migration_queue_backfill_report.json"
DEFAULT_BEFORE_DB = ROOT / "japanese_words.before_moji_review_import.20260608-030628.sqlite3"


def priority(item: dict) -> float:
    return (
        int(item.get("qWrCnt") or 0) * 20
        + max(6 - float(item.get("local_score") or 0), 0) * 10
        + int(item.get("qCnt") or 0) * 2
        + int(item.get("testTimes") or 0)
        + int(item.get("importance") or 3)
    )


def before_was_active(before_conn: sqlite3.Connection, kanji: str, kana: str) -> bool:
    row = before_conn.execute(
        """
        SELECT p.seen_count, p.known_forever
        FROM words w
        JOIN progress p ON p.word_id = w.id
        WHERE w.kanji = ? AND w.kana = ?
        """,
        (kanji, kana),
    ).fetchone()
    return bool(row and (row["seen_count"] > 0 or row["known_forever"]))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--before-db", default=str(DEFAULT_BEFORE_DB))
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    before_path = Path(args.before_db)
    if not PREVIEW_PATH.exists():
        raise SystemExit(f"missing preview: {PREVIEW_PATH}")
    if not before_path.exists():
        raise SystemExit(f"missing before db: {before_path}")

    operations = json.loads(PREVIEW_PATH.read_text(encoding="utf-8"))
    report = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "apply": args.apply,
        "previewRows": len(operations),
        "eligibleMigratedReviews": 0,
        "skippedActiveBeforeImport": 0,
        "missingCurrentWord": 0,
        "insertedOrUpdated": 0,
    }

    with sqlite3.connect(before_path) as before_conn, sqlite3.connect(DB_PATH) as conn:
        before_conn.row_factory = sqlite3.Row
        conn.row_factory = sqlite3.Row
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
            kanji = (item.get("kanji") or "").strip()
            kana = (item.get("kana") or "").strip()
            if not kanji or not kana:
                continue
            if before_was_active(before_conn, kanji, kana):
                report["skippedActiveBeforeImport"] += 1
                continue
            row = conn.execute(
                "SELECT id FROM words WHERE kanji = ? AND kana = ?",
                (kanji, kana),
            ).fetchone()
            if not row:
                report["missingCurrentWord"] += 1
                continue
            report["eligibleMigratedReviews"] += 1
            if args.apply:
                conn.execute(
                    """
                    INSERT INTO moji_migrated_reviews (word_id, imported_on, priority)
                    VALUES (?, date('now', 'localtime'), ?)
                    ON CONFLICT(word_id) DO UPDATE SET
                        priority = MAX(moji_migrated_reviews.priority, excluded.priority)
                    """,
                    (row["id"], priority(item)),
                )
                report["insertedOrUpdated"] += 1
        if args.apply:
            conn.commit()

    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
