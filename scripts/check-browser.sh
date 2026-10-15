#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
export PLAYWRIGHT_MODULE="${PLAYWRIGHT_MODULE:-$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright}"
export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-/private/tmp/tsuki-browser}"
node scripts/check-browser.mjs
