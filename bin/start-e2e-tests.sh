#!/usr/bin/env sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

sh "$SCRIPT_DIR/start-server.sh"

npx playwright test