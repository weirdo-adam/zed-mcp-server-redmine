# Redmine MCP Server for Zed

Zed extension that registers a `redmine` MCP context server and launches the
standalone `redmine-mcp-server` executable.

This repository only maintains the Zed extension. The server implementation,
GitHub Releases, and Homebrew formula are maintained in
[`weirdo-adam/redmine-mcp-server`](https://github.com/weirdo-adam/redmine-mcp-server).

## Requirements

- Zed with MCP extension support
- Redmine REST API enabled
- Redmine API key with the required project permissions

## Server Binary

The extension downloads the matching `redmine-mcp-server` GitHub Release binary
automatically and caches it in the Zed extension runtime directory.

## Zed Configuration

```json
{
  "context_servers": {
    "redmine": {
      "settings": {
        "REDMINE_BASE_URL": "https://redmine.example.com",
        "REDMINE_API_KEY": "your-api-key",
        "REDMINE_MCP_READ_ONLY": true
      }
    }
  }
}
```

Configuration precedence:

1. Zed `settings`
2. Zed `command.env`
3. Environment inherited by the Zed process

Empty string values in Zed `settings` are ignored.

To use a manually installed server, set `command` explicitly:

```json
{
  "context_servers": {
    "redmine": {
      "command": "/opt/homebrew/bin/redmine-mcp-server"
    }
  }
}
```

## Settings

| Variable | Default | Description |
| --- | --- | --- |
| `REDMINE_BASE_URL` | none | Redmine base URL. |
| `REDMINE_API_KEY` | none | Redmine REST API key. |
| `REDMINE_MCP_READ_ONLY` | `true` | Hide and reject write tools. |
| `REDMINE_MCP_ENABLE_DELETES` | `false` | Expose destructive delete/remove tools. |
| `REDMINE_TIMEOUT_MS` | `30000` | HTTP request timeout in milliseconds. |

Server settings are documented in the standalone server repository.

## Development

```sh
scripts/check.sh
```

The check script runs Rust formatting, type checking, Clippy, and the Zed WASI
target check.

## Publishing

This repository does not publish a plugin tarball or server archive. Zed
extension publishing is handled through Zed's extension registry. Server
Releases and Homebrew updates are maintained in the standalone server repository.

## Security

Permissions are determined by the configured Redmine API key. Use the least
privileged key practical for the target project, and keep real API keys in
user-scoped Zed settings.

See [SECURITY.md](SECURITY.md) for vulnerability reporting.
