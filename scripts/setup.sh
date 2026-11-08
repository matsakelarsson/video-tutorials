#!/usr/bin/env bash
# Installs what this repository needs on Linux or macOS. Safe to run more than once.
# Kept to bash 3.2 syntax because macOS ships that version.
set -euo pipefail

cd "$(dirname "$0")/.."

os="$(uname -s)"
if [ "$os" != "Linux" ] && [ "$os" != "Darwin" ]; then
  echo "This script supports Linux and macOS, not $os." >&2
  exit 1
fi

node_major=0
if command -v node >/dev/null 2>&1; then
  node_major="$(node -p 'process.versions.node.split(".")[0]')"
fi
if [ "$node_major" -lt 20 ]; then
  echo "Node.js 20 or newer is required. Found major version: $node_major." >&2
  if [ "$os" = "Darwin" ]; then
    echo "Install it with: brew install node" >&2
  else
    echo "Install it with nvm, then run 'nvm install' in this folder: https://github.com/nvm-sh/nvm" >&2
  fi
  exit 1
fi

install_ffmpeg() {
  if [ "$os" = "Darwin" ]; then
    if ! command -v brew >/dev/null 2>&1; then
      echo "ffmpeg is missing and Homebrew is not installed. Install Homebrew from https://brew.sh and rerun this script." >&2
      exit 1
    fi
    brew install ffmpeg
  elif command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y ffmpeg
  else
    echo "ffmpeg is missing. Install it with your package manager and rerun this script." >&2
    exit 1
  fi
}

if ! command -v ffmpeg >/dev/null 2>&1 || ! command -v ffprobe >/dev/null 2>&1; then
  echo "Installing ffmpeg..."
  install_ffmpeg
fi

npm ci
npx playwright install chromium

if [ "$os" = "Linux" ] && ! node -e "require('playwright').chromium.launch().then((b) => b.close())" 2>/dev/null; then
  echo "Chromium could not start. Installing its system libraries..."
  sudo npx playwright install-deps chromium
fi

npx argo doctor
echo
echo "Setup finished. Run 'npm run sample' to render a test video to videos/sample.mp4."
echo "Doctor warnings about Playwright browsers or unused voice engines are expected."
