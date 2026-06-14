#!/usr/bin/env sh
set -eu

cargo fmt --check
cargo check
cargo clippy --all-targets --all-features -- -D warnings
cargo test
cargo check --target wasm32-wasip2
