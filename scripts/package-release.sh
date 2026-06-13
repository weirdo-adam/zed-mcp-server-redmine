#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd "$SCRIPT_DIR/.." && pwd)
VERSION=$(awk -F '"' '/^version = / { print $2; exit }' "$REPO_ROOT/extension.toml")
PACKAGE_NAME="redmine-mcp-server-${VERSION}"
DIST_DIR="$REPO_ROOT/dist"
STAGE_DIR="$DIST_DIR/$PACKAGE_NAME"
ARCHIVE="$DIST_DIR/$PACKAGE_NAME.tar.gz"
WASM_SOURCE="$REPO_ROOT/target/wasm32-wasip2/release/zed_mcp_server_redmine.wasm"

if [ -z "$VERSION" ]; then
  echo "Unable to read version from extension.toml" >&2
  exit 1
fi

cd "$REPO_ROOT"

npm run lint:js
npm test
cargo fmt --check
cargo check
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release --target wasm32-wasip2

mkdir -p "$DIST_DIR"
rm -rf "$STAGE_DIR" "$ARCHIVE" "$ARCHIVE.sha256"
mkdir -p "$STAGE_DIR/server/src" "$STAGE_DIR/docs" "$STAGE_DIR/scripts"

cp "$REPO_ROOT/extension.toml" "$STAGE_DIR/extension.toml"
cp "$WASM_SOURCE" "$STAGE_DIR/extension.wasm"
cp "$REPO_ROOT/package.json" "$STAGE_DIR/package.json"
cp "$REPO_ROOT/README.md" "$STAGE_DIR/README.md"
cp "$REPO_ROOT/README.zh-CN.md" "$STAGE_DIR/README.zh-CN.md"
cp "$REPO_ROOT/LICENSE" "$STAGE_DIR/LICENSE"
cp "$REPO_ROOT/SECURITY.md" "$STAGE_DIR/SECURITY.md"
cp "$REPO_ROOT/CONTRIBUTING.md" "$STAGE_DIR/CONTRIBUTING.md"
cp "$REPO_ROOT/server/index.js" "$STAGE_DIR/server/index.js"
cp "$REPO_ROOT/server/src/"*.js "$STAGE_DIR/server/src/"
cp "$REPO_ROOT/docs/"*.md "$STAGE_DIR/docs/"
if [ -d "$REPO_ROOT/docs/assets" ]; then
  cp -R "$REPO_ROOT/docs/assets" "$STAGE_DIR/docs/assets"
fi
cp "$REPO_ROOT/scripts/install-local.sh" "$STAGE_DIR/scripts/install-local.sh"

chmod +x "$STAGE_DIR/scripts/install-local.sh"

tar -C "$DIST_DIR" -czf "$ARCHIVE" "$PACKAGE_NAME"
shasum -a 256 "$ARCHIVE" > "$ARCHIVE.sha256"

echo "Created:"
echo "  $ARCHIVE"
echo "  $ARCHIVE.sha256"
