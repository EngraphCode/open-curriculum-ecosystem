#!/usr/bin/env bash
# Install the shellcheck that the root `lint:shell` gate runs, pinned by
# version and by the sha256 of each host's release asset, into this
# repository's own .tools/bin (ignored by git). CI (.github/workflows/ci.yml),
# the cloud session hook (cloud-session-setup.sh beside this file) and
# developers all install it here, and the gate runs .tools/bin/shellcheck
# before any shellcheck on PATH, so a checkout never shares the binary with
# another repository's pin. shellcheck versions differ in what they report, so
# the pin lives here once: the gate reads SHELLCHECK_VERSION from this file and
# fails when the shellcheck it runs is another version. Moving the pin means
# changing the version and every digest together, each digest recomputed from
# a download and cross-checked against the `digest` GitHub's release API
# records for that asset.
#
# Usage: install-shellcheck.sh

# The bash floor: the shellcheck gate holds it once and requires this guard first.
if ((BASH_VERSINFO[0] < 5 || (BASH_VERSINFO[0] == 5 && BASH_VERSINFO[1] < 2))); then
  echo "bash 5.2 or later is required, found ${BASH_VERSION}: install it (brew install bash on macOS, apt-get install bash on Debian 12 or Ubuntu 24.04 and later) and put it first on PATH" >&2
  exit 1
fi

set -euo pipefail

SHELLCHECK_VERSION=0.11.0

if [[ $# -ne 0 ]]; then
  echo "usage: install-shellcheck.sh (it takes no arguments; it installs into .tools/bin)" >&2
  exit 2
fi
repo_root="$(CDPATH='' cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
bin_dir="${repo_root}/.tools/bin"

host="$(uname -s) $(uname -m)"
case "$host" in
  "Linux x86_64")
    asset=linux.x86_64
    sha256=b7af85e41cc99489dcc21d66c6d5f3685138f06d34651e6d34b42ec6d54fe6f6
    ;;
  "Linux aarch64")
    asset=linux.aarch64
    sha256=68a8133197a50beb8803f8d42f9908d1af1c5540d4bb05fdfca8c1fa47decefc
    ;;
  "Darwin x86_64")
    asset=darwin.x86_64
    sha256=c2c15e08df0e8fbc374c335b230a7ee958c313fa5714817a59aa59f1aa594f51
    ;;
  "Darwin arm64")
    asset=darwin.aarch64
    sha256=339b930feb1ea764467013cc1f72d09cd6b869ebf1013296ba9055ab2ffbd26f
    ;;
  *)
    echo "install-shellcheck: no pinned shellcheck asset for ${host}" >&2
    exit 1
    ;;
esac

archive="$(mktemp)"
trap 'rm -f "$archive"' EXIT

# https only, on the request and on every redirect hop; the asset redirects
# to release-assets.githubusercontent.com, the host gitleaks' asset uses.
curl --fail --location --silent --show-error --max-time 60 \
  --retry 3 --retry-connrefused --proto '=https' --proto-redir '=https' \
  "https://github.com/koalaman/shellcheck/releases/download/v${SHELLCHECK_VERSION}/shellcheck-v${SHELLCHECK_VERSION}.${asset}.tar.gz" \
  --output "$archive"

# The digest is checked before anything is extracted.
if command -v sha256sum > /dev/null 2>&1; then
  echo "${sha256}  ${archive}" | sha256sum --check -
else
  echo "${sha256}  ${archive}" | shasum --algorithm 256 --check -
fi

# The binary is owned by whoever runs the install, root included.
mkdir -p "$bin_dir"
tar --extract --gzip --no-same-owner --file "$archive" --directory "$bin_dir" \
  --strip-components=1 "shellcheck-v${SHELLCHECK_VERSION}/shellcheck"
"${bin_dir}/shellcheck" --version
