from __future__ import annotations

import argparse
import gzip
import json
import plistlib
import re
import shutil
import sqlite3
import time
import urllib.request
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "japanese_words.sqlite3"
CLOUD_DIR = ROOT / "data" / "moji_export" / "cloud"
PREVIEW_PATH = CLOUD_DIR / "review_import_preview.json"
DEFAULT_CACHE = Path(
    "/Users/lsc/Library/Containers/BF62961C-3055-4850-AB44-50A7F2C8ED7E/"
    "Data/Library/Caches/3EW3QF484M.MojiDict/Cache.db"
)


def request_headers(cache_db: Path) -> dict[str, str]:
    conn = sqlite3.connect(cache_db)
    row = conn.execute(
        """
        SELECT b.request_object
        FROM cfurl_cache_response e
        JOIN cfurl_cache_blob_data b ON b.entry_ID = e.entry_ID
        WHERE e.request_key LIKE '%word/detailInfo%'
        ORDER BY e.entry_ID DESC
        LIMIT 1
        """
    ).fetchone()
    if not row:
        raise SystemExit("No cached MOJi detailInfo request found.")
    obj = plistlib.loads(bytes(row[0]))
    headers = dict(obj["Array"][19])
    headers.pop("__hhaa__", None)
    headers["Accept-Encoding"] = "gzip, deflate"
    return headers


def fetch_detail(word_id: str, headers: dict[str, str]) -> dict:
    url = f"https://api.mojidict.com/app/mojidict/api/v1/word/detailInfo?wordId={word_id}"
    request = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(request, timeout=8) as response:
        raw = response.read()
        if response.headers.get("Content-Encoding") == "gzip" or raw[:2] == b"\x1f\x8b":
            raw = gzip.decompress(raw)
        return json.loads(raw.decode("utf-8"))


def first_example(detail: dict) -> tuple[str, str] | None:
    examples = detail.get("examples") or []
    by_rela: dict[str, dict[str, str]] = {}
    for example in examples:
        rela_id = str(example.get("relaId") or example.get("objectId") or "")
        title = (example.get("title") or "").strip()
        lang = example.get("lang")
        if not rela_id or not title:
            continue
        pair = by_rela.setdefault(rela_id, {})
        if lang == "ja":
            pair["jp"] = title
        elif lang == "zh-CN":
            pair["meaning"] = title
    for pair in by_rela.values():
        if pair.get("jp") and pair.get("meaning"):
            return pair["jp"], pair["meaning"]
    return None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--cache-db", type=Path, default=DEFAULT_CACHE)
    parser.add_argument("--sleep", type=float, default=0.08)
    args = parser.parse_args()

    preview = json.loads(PREVIEW_PATH.read_text(encoding="utf-8"))
    headers = request_headers(args.cache_db)
    report = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "apply": args.apply,
        "candidates": 0,
        "fetched": 0,
        "withExample": 0,
        "updated": 0,
        "missingExample": 0,
        "failed": [],
    }

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        candidates = []
        for item in preview:
            row = conn.execute(
                """
                SELECT id, example_jp, example_meaning
                FROM words
                WHERE kanji = ? AND kana = ?
                """,
                (item["kanji"], item["kana"]),
            ).fetchone()
            if not row:
                continue
            if (row["example_jp"] or "").strip() or (row["example_meaning"] or "").strip():
                continue
            candidates.append((row["id"], str(item["mojiWordId"]), item["kanji"], item["kana"]))

        report["candidates"] = len(candidates)
        if args.apply and candidates:
            backup = ROOT / f"japanese_words.before_moji_examples.{datetime.now().strftime('%Y%m%d-%H%M%S')}.sqlite3"
            shutil.copy2(DB_PATH, backup)
            report["backup"] = str(backup)

        for index, (word_pk, moji_id, kanji, kana) in enumerate(candidates, start=1):
            if not re.fullmatch(r"\d+", moji_id):
                report["missingExample"] += 1
                print(f"{index}/{len(candidates)} skip nonnumeric id {kanji} {kana}", flush=True)
                continue
            try:
                print(f"{index}/{len(candidates)} fetch {kanji} {kana}", flush=True)
                detail = fetch_detail(moji_id, headers)
                report["fetched"] += 1
                example = first_example(detail)
                if not example:
                    report["missingExample"] += 1
                    print(f"{index}/{len(candidates)} no example {kanji} {kana}", flush=True)
                    continue
                report["withExample"] += 1
                if args.apply:
                    conn.execute(
                        """
                        UPDATE words
                        SET example_jp = ?, example_meaning = ?
                        WHERE id = ?
                          AND COALESCE(example_jp, '') = ''
                          AND COALESCE(example_meaning, '') = ''
                        """,
                        (example[0], example[1], word_pk),
                    )
                    report["updated"] += 1
                print(f"{index}/{len(candidates)} ok {kanji} {kana}", flush=True)
            except Exception as error:  # noqa: BLE001
                report["failed"].append({"mojiWordId": moji_id, "kanji": kanji, "error": str(error)})
                print(f"{index}/{len(candidates)} fail {kanji} {kana}: {error}", flush=True)
            time.sleep(args.sleep)

        if args.apply:
            conn.commit()

    report_path = CLOUD_DIR / "moji_example_backfill_report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
