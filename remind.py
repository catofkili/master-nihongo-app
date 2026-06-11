from __future__ import annotations

import argparse
import subprocess
import sys
from datetime import datetime
from pathlib import Path

import server


def applescript_string(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def notify(title: str, message: str) -> None:
    script = (
        f"display dialog {applescript_string(message)} "
        f"with title {applescript_string(title)} "
        'buttons {"知道了"} default button "知道了"'
    )
    result = subprocess.run(["osascript", "-e", script], check=False, capture_output=True, text=True)
    write_run_log(f"osascript return={result.returncode} stdout={result.stdout.strip()} stderr={result.stderr.strip()}")


def write_run_log(message: str) -> None:
    log_path = Path(__file__).resolve().parent / "reminder.run.log"
    timestamp = datetime.now().isoformat(timespec="seconds")
    with log_path.open("a", encoding="utf-8") as file:
        file.write(f"{timestamp} {message}\n")


def first_stage_done() -> tuple[bool, dict]:
    server.init_db()
    with server.connect() as conn:
        stats = server.stats(conn)
    return bool(stats["stage1Done"]), stats


def main() -> int:
    parser = argparse.ArgumentParser(description="提醒今天还没有完成第一阶段背词。")
    parser.add_argument("--dry-run", action="store_true", help="只打印检查结果，不发送通知。")
    parser.add_argument("--notify-even-if-done", action="store_true", help="测试通知用：完成也发送通知。")
    args = parser.parse_args()

    done, stats = first_stage_done()
    progress = f'{stats["stage1ProgressDone"]}/{stats["stage1ProgressTotal"]}'
    status = "done" if done else "pending"
    print(f'{stats["studyDate"]} stage1={status} progress={progress}')
    write_run_log(f'{stats["studyDate"]} stage1={status} progress={progress}')

    if args.dry_run:
        return 0
    if done and not args.notify_even_if_done:
        return 0

    project = Path(__file__).resolve().parent
    notify(
        "日语背词提醒",
        f"今天第一阶段还没完成：{progress}。打开 {project / 'static' / 'index.html'} 或 http://127.0.0.1:8000",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
