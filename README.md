# Redmine MCP Server for Zed

Zed extension that registers a `redmine` MCP context server and launches the
standalone `redmine-mcp-server` executable.

This repository only maintains the Zed extension. The server implementation,
GitHub Releases, and Homebrew formula are maintained in
[`weirdo-adam/redmine-mcp-server`](https://github.com/weirdo-adam/redmine-mcp-server).

## Requirements

- Zed with MCP extension support
- `redmine-mcp-server` installed locally
- Redmine REST API enabled
- Redmine API key with the required project permissions

## Server Installation

```sh
brew install weirdo-adam/tap/redmine-mcp-server
```

Apple Silicon Homebrew installs the executable at:

```text
/opt/homebrew/bin/redmine-mcp-server
```

Intel macOS Homebrew installs the executable at:

```text
/usr/local/bin/redmine-mcp-server
```

## Zed Configuration

On macOS, the extension uses the standard Homebrew path by default:

- Apple Silicon: `/opt/homebrew/bin/redmine-mcp-server`
- Intel: `/usr/local/bin/redmine-mcp-server`

If the server is installed in another location, set `command` explicitly.

```json
{
  "context_servers": {
    "redmine": {
      "command": "/opt/homebrew/bin/redmine-mcp-server",
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

Empty string values in Zed `settings` are ignored, allowing the server to use
environment variables inherited by Zed. Environment variables from `.zshrc` are
not reliable when Zed is launched from Dock or Spotlight.

## Settings

| Variable | Default | Description |
| --- | --- | --- |
| `REDMINE_BASE_URL` | none | Redmine base URL. |
| `REDMINE_API_KEY` | none | Redmine REST API key. |
| `REDMINE_MCP_READ_ONLY` | `true` | Hide and reject write tools. |
| `REDMINE_MCP_ENABLE_DELETES` | `false` | Expose destructive delete/remove tools. |
| `REDMINE_TIMEOUT_MS` | `30000` | HTTP request timeout in milliseconds. |

Additional server settings are documented in the standalone server repository.

## Development

```sh
scripts/check.sh
```

The check script runs Rust formatting, type checking, Clippy, and the Zed WASI
target check.

## Publishing

This repository does not publish a plugin tarball or server archive. Zed
extension publishing is handled through Zed's extension registry. Server
Releases and Homebrew updates belong to the standalone server repository.

## Security

Permissions are determined by the configured Redmine API key. Use the least
privileged key practical for the target project, and keep real API keys in
user-scoped Zed settings.

See [SECURITY.md](SECURITY.md) for vulnerability reporting.
