#!/usr/bin/env bash
# Machine checks Dean or an agent can run before a store upload.
# Does not replace device QA or a Mac archive.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SKIP_FLUTTER=0
ARTIFACT=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-flutter) SKIP_FLUTTER=1; shift ;;
    --artifact) ARTIFACT="$2"; shift 2 ;;
    *)
      if [[ -z "$ARTIFACT" && -f "$1" ]]; then
        ARTIFACT="$1"
        shift
      else
        echo "Usage: tool/ship_check.sh [--skip-flutter] [--artifact app-release.aab|apk]" >&2
        exit 2
      fi
      ;;
  esac
done

fail() { echo "FAIL: $*" >&2; exit 1; }

[[ -f assets/sayings.json ]] || fail "missing assets/sayings.json"
[[ -f docs/privacy.html ]] || fail "missing docs/privacy.html"
[[ -f ../public/privacy.html ]] || fail "missing public/privacy.html (GitHub Pages copy)"

if ! cmp -s docs/privacy.html ../public/privacy.html; then
  fail "docs/privacy.html and public/privacy.html drifted — stores need one text"
fi

python3 tool/check_16kb.py --self-test

if [[ "$SKIP_FLUTTER" -eq 0 ]]; then
  command -v flutter >/dev/null || fail "flutter not on PATH"
  flutter analyze
  flutter test
fi

if [[ -n "$ARTIFACT" ]]; then
  python3 tool/check_16kb.py "$ARTIFACT"
fi

echo "OK: ship_check (product files +$([[ "$SKIP_FLUTTER" -eq 0 ]] && echo ' analyze/test' || echo ' file invariants')$([[ -n "$ARTIFACT" ]] && echo ' + 16KB' || true))"
