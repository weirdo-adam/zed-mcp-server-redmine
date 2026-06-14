# Contributing

Keep changes focused and include tests for behavior changes.

## Development Setup

Install a recent Rust toolchain with the components in `rust-toolchain.toml`.

Clone the repository and run checks from the repository root.

## Checks

Run the local check script before opening a pull request:

```sh
scripts/check.sh
```

Individual commands:

```sh
cargo fmt --check
cargo check
cargo clippy --all-targets --all-features -- -D warnings
cargo check --target wasm32-wasip2
```

## Pull Requests

- Keep pull requests scoped to one extension behavior or documentation change.
- Update `README.md`, `README.zh-CN.md`, or `docs/client-configuration.md` when
  changing user-facing configuration behavior.
- Do not include Redmine API keys, private issue data, internal Redmine URLs, or
  generated local artifacts.

## Scope

This repository only maintains the Zed extension. Redmine MCP server behavior,
tool definitions, Releases, and Homebrew formula updates belong to the
standalone `redmine-mcp-server` repository.
