# Redmine MCP Server for Zed

[简体中文](README.zh-CN.md)

This extension follows Zed's
[MCP extension model](https://zed.dev/docs/extensions/mcp-extensions), registers
a `redmine` MCP context server, and runs a bundled Node.js stdio MCP server.

## Configuration

Install the directory as a Zed dev extension, then configure:

```json
{
  "context_servers": {
    "redmine": {
      "settings": {
        "REDMINE_BASE_URL": "https://redmine.example.com",
        "REDMINE_API_KEY": "your-api-key",
        "REDMINE_SILENT_WRITES": false,
        "REDMINE_TIMEOUT_MS": 30000
      }
    }
  }
}
```

The server also reads the same values from the process environment. The extension
accepts lowercase aliases such as `base_url`, `api_key`, and `silent_writes`, but
passes canonical `REDMINE_*` variables to the server.

`REDMINE_SILENT_WRITES=true` makes write tools return compact success payloads
and sends `notify=false` on Redmine write requests. Individual write tools also
accept `silent` and `notify` arguments.

## Tools

The server exposes Redmine tools for:

- Issues: get, list, update.
- Checklists: list, add, update, delete via `checklists_attributes`.
- Time entries: list, add, update, delete, plus activity listing.
- Versions: list, get, create, update, delete.
- Watchers: list, add, remove.
- Metadata: projects, issue statuses, users.

## Development

```sh
npm test
cargo check --target wasm32-wasip2
```

The MCP stdio transport uses newline-delimited JSON-RPC on stdout. Logs and
diagnostics must go to stderr.
