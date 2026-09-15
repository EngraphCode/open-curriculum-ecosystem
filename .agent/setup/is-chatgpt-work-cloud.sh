#!/usr/bin/env bash

set -euo pipefail

[[ "${CODEX_CI:-}" == "1" && -n "${CODEX_ENVIRONMENT_ID:-}" ]]
