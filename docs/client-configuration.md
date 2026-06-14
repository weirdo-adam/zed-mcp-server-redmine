# Client Configuration

This extension launches a locally installed `redmine-mcp-server` executable. It
does not bundle or download the server.

Install the server first:

```sh
brew install weirdo-adam/tap/redmine-mcp-server
```

## Zed

On macOS, the extension uses the standard Homebrew path by default:

- Apple Silicon: `/opt/homebrew/bin/redmine-mcp-server`
- Intel: `/usr/local/bin/redmine-mcp-server`

If the server is installed in another location, set `command` explicitly:

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

If `redmine-mcp-server` is available in the environment inherited by Zed on
another platform, the `command` block can be omitted. GUI-launched Zed usually
does not read `.zshrc`.

## Configuration Precedence

The extension passes environment variables to the server in this order:

1. Zed `settings`
2. Zed `command.env`
3. Environment inherited by the Zed process

Empty string values in Zed `settings` are ignored. This allows fallback to
environment variables inherited by Zed.

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `REDMINE_BASE_URL` | none | Redmine base URL. |
| `REDMINE_API_KEY` | none | Redmine REST API key. |
| `REDMINE_MCP_READ_ONLY` | `true` | Hide and reject write tools. |
| `REDMINE_MCP_ENABLE_DELETES` | `false` | Expose delete and remove tools. |
| `REDMINE_TIMEOUT_MS` | `30000` | HTTP request timeout in milliseconds. |
| `REDMINE_MCP_ATTACHMENT_MAX_BYTES` | `10485760` | Maximum attachment download size in bytes. |
| `REDMINE_MCP_DISABLE_ATTACHMENTS` | `false` | Disable attachment tools. |
| `REDMINE_MCP_DISABLE_CHECKLISTS` | `false` | Disable Redmine Checklists tools. |
| `REDMINE_MCP_DISABLE_RELATIONS` | `false` | Disable issue relation tools. |
| `REDMINE_MCP_DISABLE_TIME_ENTRIES` | `false` | Disable time entry tools. |
| `REDMINE_MCP_DISABLE_VERSIONS` | `false` | Disable version tools. |
| `REDMINE_MCP_DISABLE_WATCHERS` | `false` | Disable watcher tools. |
| `REDMINE_MCP_DISABLE_WIKI` | `false` | Disable wiki tools. |

## External Clients

Claude, Codex, and other MCP client examples are documented in the standalone
server repository:

```text
https://github.com/weirdo-adam/redmine-mcp-server
```
