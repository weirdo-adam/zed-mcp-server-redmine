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
        "REDMINE_MCP_READ_ONLY": false,
        "REDMINE_MCP_DISABLE_CHECKLISTS": false,
        "REDMINE_MCP_DISABLE_RELATIONS": false,
        "REDMINE_MCP_DISABLE_TIME_ENTRIES": false,
        "REDMINE_MCP_DISABLE_VERSIONS": false,
        "REDMINE_MCP_DISABLE_WATCHERS": false,
        "REDMINE_SILENT_WRITES": false,
        "REDMINE_TIMEOUT_MS": 30000
      }
    }
  }
}
```

The extension passes configured settings to the bundled server as canonical
`REDMINE_*` environment variables. The server also reads the same variables
directly from the process environment, so the same binary can be run outside Zed.

Use the `REDMINE_*` keys below in Zed settings and process environments. The
extension passes those settings to the bundled server as environment variables.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `REDMINE_BASE_URL` | Yes | none | Base URL for the Redmine instance, for example `https://redmine.example.com`. |
| `REDMINE_API_KEY` | Yes | none | Redmine REST API key. |
| `REDMINE_MCP_READ_ONLY` | No | `false` | Enables read-only mode. Write tools are hidden from `tools/list` and rejected if called directly. |
| `REDMINE_MCP_DISABLE_CHECKLISTS` | No | `false` | Disables checklist tools. Leave `false` only when the `redmine_checklists` plugin is installed. |
| `REDMINE_MCP_DISABLE_RELATIONS` | No | `false` | Disables issue relation tools. |
| `REDMINE_MCP_DISABLE_TIME_ENTRIES` | No | `false` | Disables time entry tools. |
| `REDMINE_MCP_DISABLE_VERSIONS` | No | `false` | Disables version/milestone tools. |
| `REDMINE_MCP_DISABLE_WATCHERS` | No | `false` | Disables watcher tools. |
| `REDMINE_SILENT_WRITES` | No | `false` | Makes write tools return compact success payloads and sends `notify=false` on Redmine write requests. |
| `REDMINE_TIMEOUT_MS` | No | `30000` | HTTP request timeout in milliseconds. |

Environment-only example:

```sh
export REDMINE_BASE_URL="https://redmine.example.com"
export REDMINE_API_KEY="your-api-key"
export REDMINE_MCP_READ_ONLY=true
node server/index.js
```

`REDMINE_MCP_READ_ONLY=true` is the safest mode for agents that should inspect
Redmine but never mutate it. `REDMINE_SILENT_WRITES=true` only changes write
notification/output behavior; it does not prevent writes. Individual write tools
also accept `silent` and `notify` arguments.

## Tools

The server exposes Redmine tools for:

- Issues: get, list, update.
- Issue relations: list, get, add, delete.
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
