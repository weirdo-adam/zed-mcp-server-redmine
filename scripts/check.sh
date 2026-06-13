#!/usr/bin/env sh
set -eu

npm run lint:js
npm test
cargo fmt --check
cargo check
cargo clippy --all-targets --all-features -- -D warnings
cargo check --target wasm32-wasip2
