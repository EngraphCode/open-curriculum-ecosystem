#!/bin/bash
# macOS validation of PR #891 at 299a33f1b — install then full local gate.
# Output captured to files; exit codes echoed in-band.
cd "$(dirname "$0")" || exit 1
pnpm install --frozen-lockfile > .macos-validation-install.log 2>&1
echo "install exit: $?"
pnpm check > .macos-validation-check.log 2>&1
echo "check exit: $?"
