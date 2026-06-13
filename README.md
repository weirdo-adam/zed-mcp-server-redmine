# Redmine MCP Server for Zed

[简体中文](README.zh-CN.md)

A Zed extension that registers a `redmine` MCP context server and runs the
bundled stdio MCP server with Zed's Node.js runtime. The bundled
`server/index.js` entrypoint can also run as a local MCP server for agent
development tools that support stdio MCP servers.

## Requirements

- Redmine with REST API access enabled.
- A Redmine API key with the required project permissions.
- Redmine Checklists plugin, only for checklist tools.

## Installation

Published builds are installed through Zed's extension registry. For local
development, clone this repository and load it through Zed's development
extension workflow.

Zed starts `server/index.js` with its bundled Node.js runtime. A separate Node.js
installation is only required for local development or standalone server tests.

## Configuration

Configure the `redmine` context server in Zed settings:

```json
{
  "context_servers": {
    "redmine": {
      "settings": {
        "REDMINE_BASE_URL": "https://redmine.example.com",
        "REDMINE_API_KEY": "your-api-key",
        "REDMINE_MCP_READ_ONLY": false
      }
    }
  }
}
```

Settings are mapped to the `REDMINE_*` environment variables used by the server.
Optional tool groups are enabled by default.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `REDMINE_BASE_URL` | Yes | none | Redmine base URL. |
| `REDMINE_API_KEY` | Yes | none | Redmine REST API key. |
| `REDMINE_MCP_READ_ONLY` | No | `false` | Hide and reject write tools. |
| `REDMINE_MCP_DISABLE_ATTACHMENTS` | No | `false` | Disable attachment tools. |
| `REDMINE_MCP_DISABLE_CHECKLISTS` | No | `false` | Disable checklist tools. |
| `REDMINE_MCP_DISABLE_RELATIONS` | No | `false` | Disable issue relation tools. |
| `REDMINE_MCP_DISABLE_TIME_ENTRIES` | No | `false` | Disable time entry tools. |
| `REDMINE_MCP_DISABLE_VERSIONS` | No | `false` | Disable version tools. |
| `REDMINE_MCP_DISABLE_WATCHERS` | No | `false` | Disable watcher tools. |
| `REDMINE_MCP_ATTACHMENT_MAX_BYTES` | No | `10485760` | Maximum attachment upload/download payload size returned through MCP. |
| `REDMINE_SILENT_WRITES` | No | `false` | Return compact write results and send `notify=false`. |
| `REDMINE_TIMEOUT_MS` | No | `30000` | HTTP request timeout in milliseconds. |

Write tools also support per-call `silent` and `notify` overrides.

Standalone stdio server example:

```sh
export REDMINE_BASE_URL="https://redmine.example.com"
export REDMINE_API_KEY="your-api-key"
export REDMINE_MCP_READ_ONLY=true
node server/index.js
```

## Agent Client Configuration

The server uses the standard stdio MCP transport. It can be configured in Zed,
Claude Code or Claude Desktop, Codex, and other local MCP clients by launching
`node /absolute/path/to/server/index.js` with the `REDMINE_*` environment
variables.

See [docs/client-configuration.md](docs/client-configuration.md) for client
configuration examples.

Local one-command install for non-Zed MCP clients:

```sh
scripts/install-local.sh
```

## Security

Effective permissions are determined by the configured Redmine API key. Use the
least privileged key practical for the target project and set
`REDMINE_MCP_READ_ONLY=true` when write operations are not required.

Do not disclose API keys, private Redmine data, or internal Redmine URLs in
public issues, pull requests, screenshots, or logs. See
[SECURITY.md](SECURITY.md) for vulnerability reporting.

## Available Tools

Tool schemas are returned through MCP `tools/list`.
See [docs/api-coverage.md](docs/api-coverage.md) for Redmine REST API coverage
status and planned additions.

| Group | Tools | Availability | Notes |
| --- | --- | --- | --- |
| Issues | `redmine_list_issues`, `redmine_get_issue`, `redmine_create_issue`, `redmine_update_issue` | Always enabled | Write tools are hidden in read-only mode. |
| Search and metadata | `redmine_search`, `redmine_list_projects`, `redmine_get_project`, `redmine_list_issue_statuses`, `redmine_list_trackers`, `redmine_list_issue_priorities`, `redmine_list_issue_categories`, `redmine_list_custom_fields`, `redmine_list_queries`, `redmine_list_users`, `redmine_get_current_user` | Always enabled | Read-only. |
| Attachments | `redmine_get_attachment`, `redmine_download_attachment`, `redmine_upload_attachment` | Disable with `REDMINE_MCP_DISABLE_ATTACHMENTS=true`. | Upload is hidden in read-only mode. Download returns base64 or UTF-8 text. |
| Issue relations | `redmine_list_issue_relations`, `redmine_get_issue_relation`, `redmine_add_issue_relation`, `redmine_delete_issue_relation` | Disable with `REDMINE_MCP_DISABLE_RELATIONS=true`. | Write tools are hidden in read-only mode. |
| Checklists | `redmine_list_checklists`, `redmine_add_checklist_item`, `redmine_update_checklist_item`, `redmine_delete_checklist_item` | Disable with `REDMINE_MCP_DISABLE_CHECKLISTS=true`. | Requires Redmine Checklists. |
| Time entries | `redmine_list_time_entries`, `redmine_get_time_entry`, `redmine_add_time_entry`, `redmine_update_time_entry`, `redmine_delete_time_entry`, `redmine_list_time_entry_activities` | Disable with `REDMINE_MCP_DISABLE_TIME_ENTRIES=true`. | Write tools are hidden in read-only mode. |
| Versions | `redmine_list_versions`, `redmine_get_version`, `redmine_create_version`, `redmine_update_version`, `redmine_delete_version` | Disable with `REDMINE_MCP_DISABLE_VERSIONS=true`. | Write tools are hidden in read-only mode. |
| Watchers | `redmine_list_watchers`, `redmine_add_watcher`, `redmine_remove_watcher` | Disable with `REDMINE_MCP_DISABLE_WATCHERS=true`. | Write tools are hidden in read-only mode. |

## Development

```sh
scripts/check.sh
```

The check script runs JavaScript syntax checks, Node.js tests, Rust formatting,
Rust clippy, and the Zed WASI target check.

The MCP stdio transport uses newline-delimited JSON-RPC on stdout. Logs and
diagnostics must be written to stderr.

## Local Releases

Local release archives are maintained manually. To build the Zed extension wasm
and create a distributable archive under `dist/`:

```sh
scripts/package-release.sh
```

The archive includes the Zed extension files, the standalone MCP server, docs,
and the local install script. Publish the generated archive and `.sha256` file
as release assets when maintaining releases outside the Zed extension registry.

## Support

Use GitHub Issues for defects and feature requests. Include the extension
version, Zed version, Redmine version, relevant configuration flags, and
sanitized MCP server logs.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md) before
opening pull requests or sensitive reports.
