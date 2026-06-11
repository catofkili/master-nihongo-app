import argparse
import json
import plistlib
import sqlite3
import time
import urllib.error
import urllib.request
import gzip
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "moji_export" / "cloud"
DEFAULT_CACHE = Path(
    "/Users/lsc/Library/Containers/BF62961C-3055-4850-AB44-50A7F2C8ED7E/"
    "Data/Library/Caches/3EW3QF484M.MojiDict/Cache.db"
)


def cached_request(cache_db: Path, entry_id: int) -> tuple[str, dict[str, str], dict]:
    conn = sqlite3.connect(cache_db)
    row = conn.execute(
        "SELECT request_object FROM cfurl_cache_blob_data WHERE entry_ID = ?",
        (entry_id,),
    ).fetchone()
    if not row:
        raise SystemExit(f"Cache entry not found: {entry_id}")
    obj = plistlib.loads(bytes(row[0]))
    array = obj["Array"]
    url = array[1]["_CFURLString"]
    headers = dict(array[19])
    headers.pop("__hhaa__", None)
    body = json.loads(array[21][0].decode("utf-8"))
    return url, headers, body


def post_json(url: str, headers: dict[str, str], body: dict) -> dict:
    data = json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    request_headers = dict(headers)
    request_headers.setdefault(
        "User-Agent",
        "MOJiDict/8.36.1 (3EW3QF484M.MojiDict; build:20260427; iOS 26.5.0) Alamofire/5.11.1",
    )
    request_headers["Content-Length"] = str(len(data))
    request = urllib.request.Request(url, data=data, headers=request_headers, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            raw = response.read()
            if response.headers.get("Content-Encoding") == "gzip" or raw[:2] == b"\x1f\x8b":
                raw = gzip.decompress(raw)
            return json.loads(raw.decode("utf-8"))
    except urllib.error.HTTPError as error:
        text = error.read().decode("utf-8", "replace")
        raise RuntimeError(f"HTTP {error.code}: {text}") from error


def fetch_teststates(cache_db: Path) -> list[dict]:
    url, headers, body = cached_request(cache_db, 1908)
    body["limit"] = 200
    all_rows: list[dict] = []
    page = 1
    while True:
        body["page"] = page
        payload = post_json(url, headers, body)
        result = payload.get("result", {})
        rows = result.get("result", [])
        all_rows.extend(rows)
        count = result.get("count") or len(all_rows)
        print(f"teststates page {page}: {len(rows)} rows, total {len(all_rows)}/{count}")
        if not rows or len(all_rows) >= count:
            break
        page += 1
        time.sleep(0.3)
    return all_rows


def fetch_reviews(cache_db: Path, start_score: int = 0, end_score: int = 100) -> list[dict]:
    url, headers, body = cached_request(cache_db, 1909)
    body["limit"] = 200
    body["startScore"] = start_score
    body["endScore"] = end_score
    all_rows: list[dict] = []
    page = 1
    while True:
        body["page"] = page
        payload = post_json(url, headers, body)
        if isinstance(payload, dict) and isinstance(payload.get("result"), list):
            rows = payload["result"]
            total = len(all_rows) + len(rows) + (0 if len(rows) < body["limit"] else body["limit"])
        elif isinstance(payload, dict) and isinstance(payload.get("data"), list):
            rows = payload["data"]
            total = payload.get("total") or len(all_rows) + len(rows)
        elif isinstance(payload, dict) and isinstance(payload.get("result"), dict):
            result = payload["result"]
            rows = result.get("result") or result.get("docs") or result.get("data") or []
            total = result.get("count") or result.get("total") or len(all_rows) + len(rows)
        else:
            rows = []
            total = len(all_rows)
        all_rows.extend(rows)
        print(f"reviews {start_score}-{end_score} page {page}: {len(rows)} rows, total {len(all_rows)}/{total}")
        if not rows or len(all_rows) >= total:
            break
        page += 1
        time.sleep(0.3)
    return all_rows


def fetch_review_ranges(cache_db: Path) -> list[dict]:
    merged: dict[str, dict] = {}
    for start, end in [(0, 21), (22, 50), (51, 80), (81, 100)]:
        for row in fetch_reviews(cache_db, start, end):
            merged[row.get("targetId") or row.get("objectId")] = row
    return list(merged.values())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cache-db", type=Path, default=DEFAULT_CACHE)
    parser.add_argument("--reviews", action="store_true")
    args = parser.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    teststates = fetch_teststates(args.cache_db)
    (OUT / "teststates_list.json").write_text(
        json.dumps(teststates, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {OUT / 'teststates_list.json'}")

    if args.reviews:
        reviews = fetch_review_ranges(args.cache_db)
        (OUT / "test_reviews.json").write_text(
            json.dumps(reviews, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"wrote {OUT / 'test_reviews.json'}")


if __name__ == "__main__":
    main()
