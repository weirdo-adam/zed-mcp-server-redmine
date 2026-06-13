# Contributing

## Development Setup

Install a recent Rust toolchain with the components in `rust-toolchain.toml` and
Node.js 18.17 or newer.

## Checks

Run the same checks used by CI:

```sh
scripts/check.sh
```

Individual commands:

```sh
npm run lint:js
npm test
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo check --target wasm32-wasip2
```

The MCP server speaks newline-delimited JSON-RPC over stdio. Keep stdout reserved
for protocol messages; write diagnostics to stderr.
