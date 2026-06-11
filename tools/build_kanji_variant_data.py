from __future__ import annotations

import json
import urllib.request
import zipfile
from io import BytesIO
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
OUTPUT = DATA_DIR / "kanji_variants.json"

OPENCC_BASE = "https://raw.githubusercontent.com/BYVoid/OpenCC/master/data/dictionary"
JP_VARIANTS_URL = f"{OPENCC_BASE}/JPVariants.txt"
TS_CHARACTERS_URL = f"{OPENCC_BASE}/TSCharacters.txt"
UNIHAN_URL = "https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip"


def read_text_url(url: str) -> str:
    with urllib.request.urlopen(url, timeout=30) as response:
        return response.read().decode("utf-8")


def parse_opencc_dict(text: str) -> dict[str, str]:
    result = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        key, values = line.split("\t", 1)
        first = values.split()[0]
        if len(key) == 1 and len(first) == 1:
            result[key] = first
    return result


def parse_unihan_simplified(zip_bytes: bytes) -> dict[str, str]:
    result = {}
    with zipfile.ZipFile(BytesIO(zip_bytes)) as archive:
        with archive.open("Unihan_Variants.txt") as file:
            for raw_line in file:
                line = raw_line.decode("utf-8").strip()
                if not line or line.startswith("#") or "\tkSimplifiedVariant\t" not in line:
                    continue
                code, _, variants = line.split("\t", 2)
                source = chr(int(code[2:], 16))
                target_code = variants.split()[0]
                target = chr(int(target_code[2:], 16))
                if len(source) == 1 and len(target) == 1:
                    result[source] = target
    return result


def main() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    jp_variants = parse_opencc_dict(read_text_url(JP_VARIANTS_URL))
    traditional_to_simplified = parse_opencc_dict(read_text_url(TS_CHARACTERS_URL))

    japanese_to_traditional = {}
    for traditional, japanese in jp_variants.items():
        japanese_to_traditional.setdefault(japanese, traditional)

    japanese_to_simplified = {}
    for japanese, traditional in japanese_to_traditional.items():
        simplified = traditional_to_simplified.get(traditional)
        if simplified and simplified != japanese:
            japanese_to_simplified[japanese] = simplified

    with urllib.request.urlopen(UNIHAN_URL, timeout=30) as response:
        unihan = parse_unihan_simplified(response.read())

    for source, simplified in unihan.items():
        if simplified != source:
            japanese_to_simplified.setdefault(source, simplified)

    payload = {
        "source": {
            "opencc_jp_variants": JP_VARIANTS_URL,
            "opencc_ts_characters": TS_CHARACTERS_URL,
            "unihan": UNIHAN_URL,
        },
        "japanese_to_simplified": dict(sorted(japanese_to_simplified.items())),
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {OUTPUT} with {len(japanese_to_simplified)} mappings")


if __name__ == "__main__":
    main()
