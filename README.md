# Redmine MCP Server for Zed

[简体中文](README.zh-CN.md)

This Zed extension follows the
[MCP extension model](https://zed.dev/docs/extensions/mcp-extensions), registers
a `redmine` MCP context server, and starts the included stdio MCP server with
Zed's Node.js runtime.

## Requirements

- A Redmine instance with the REST API enabled.
- A Redmine API key with permission to read or update the resources you expose to
  the agent.
- The Redmine Checklists plugin is required only when checklist tools are
  enabled.

## Installation

Install the extension from Zed's extension registry when it is available. For
local development, clone this repository and load it with Zed's development
extension workflow.

When loaded by Zed, the extension uses Zed's bundled Node.js runtime to start
`server/index.js`; a separate global Node.js installation is not required for
normal extension use.

## Configuration

After installing the Zed extension, configure the Redmine context server in Zed
settings:

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

The extension maps Zed settings to the canonical `REDMINE_*` environment
variables consumed by the bundled server. The same variables can also be used
when running the server outside Zed.

Optional tool groups are enabled by default. Use `REDMINE_MCP_DISABLE_*`
settings to reduce the exposed tool set or to disable features that depend on
unavailable Redmine plugins.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `REDMINE_BASE_URL` | Yes | none | Base URL for the Redmine instance, for example `https://redmine.example.com`. |
| `REDMINE_API_KEY` | Yes | none | Redmine REST API key. |
| `REDMINE_MCP_READ_ONLY` | No | `false` | Enables read-only mode. Write tools are hidden from `tools/list` and rejected if called directly. |
| `REDMINE_MCP_DISABLE_CHECKLISTS` | No | `false` | Disables checklist tools. Checklist tools require the Redmine Checklists plugin when enabled. |
| `REDMINE_MCP_DISABLE_RELATIONS` | No | `false` | Disables issue relation tools. |
| `REDMINE_MCP_DISABLE_TIME_ENTRIES` | No | `false` | Disables time entry tools. |
| `REDMINE_MCP_DISABLE_VERSIONS` | No | `false` | Disables version/milestone tools. |
| `REDMINE_MCP_DISABLE_WATCHERS` | No | `false` | Disables watcher tools. |
| `REDMINE_SILENT_WRITES` | No | `false` | Makes write tools return compact success payloads and sends `notify=false` on Redmine write requests. |
| `REDMINE_TIMEOUT_MS` | No | `30000` | HTTP request timeout in milliseconds. |

Local stdio server example:

```sh
export REDMINE_BASE_URL="https://redmine.example.com"
export REDMINE_API_KEY="your-api-key"
export REDMINE_MCP_READ_ONLY=true
node server/index.js
```

`REDMINE_MCP_READ_ONLY=true` disables all write tools. `REDMINE_SILENT_WRITES=true`
changes write notification and response behavior only; it does not block write
operations. Write tools also accept per-call `silent` and `notify` arguments.

## Safety

This extension can create, update, and delete Redmine data when the configured
API key has permission to do so. Set `REDMINE_MCP_READ_ONLY=true` before using
the server in projects where the agent must not modify Redmine.

Use a Redmine API key with the smallest practical permission scope. Do not share
API keys, private issue data, or Redmine URLs in public bug reports.

## Available Tools

Core features are always active.

Issues:

- `redmine_list_issues` - List issues with Redmine filters.
- `redmine_create_issue` - Create an issue.
- `redmine_get_issue` - Get issue details.
- `redmine_update_issue` - Update an issue and optionally suppress email notifications.

Search and metadata:

- `redmine_search` - Search across Redmine.
- `redmine_list_projects` - List projects.
- `redmine_list_issue_statuses` - List issue statuses.
- `redmine_list_users` - List users.

Optional features are enabled by default and can be disabled individually.

Issue relations:

- `redmine_list_issue_relations` - List relations for an issue.
- `redmine_get_issue_relation` - Get a relation.
- `redmine_add_issue_relation` - Create a relation between issues.
- `redmine_delete_issue_relation` - Delete a relation.
- Disable with `REDMINE_MCP_DISABLE_RELATIONS=true`.

Checklists:

- `redmine_list_checklists` - List checklist items for an issue.
- `redmine_add_checklist_item` - Add a checklist item.
- `redmine_update_checklist_item` - Update a checklist item.
- `redmine_delete_checklist_item` - Delete a checklist item.
- Requires the Redmine Checklists plugin. Disable with `REDMINE_MCP_DISABLE_CHECKLISTS=true`.

Time entries:

- `redmine_list_time_entries` - List time entries with filters.
- `redmine_add_time_entry` - Create a time entry.
- `redmine_update_time_entry` - Update a time entry.
- `redmine_delete_time_entry` - Delete a time entry.
- `redmine_list_time_entry_activities` - List time entry activities.
- Disable with `REDMINE_MCP_DISABLE_TIME_ENTRIES=true`.

Versions:

- `redmine_list_versions` - List project versions/milestones.
- `redmine_get_version` - Get a version.
- `redmine_create_version` - Create a version.
- `redmine_update_version` - Update a version.
- `redmine_delete_version` - Delete a version.
- Disable with `REDMINE_MCP_DISABLE_VERSIONS=true`.

Watchers:

- `redmine_list_watchers` - List issue watchers.
- `redmine_add_watcher` - Add a watcher.
- `redmine_remove_watcher` - Remove a watcher.
- Disable with `REDMINE_MCP_DISABLE_WATCHERS=true`.

## Development

```sh
npm test
cargo check --target wasm32-wasip2
```

Full local check:

```sh
scripts/check.sh
```

CI runs the same checks on pull requests and pushes to `main`.

The MCP stdio transport uses newline-delimited JSON-RPC on stdout. Logs and
diagnostics must go to stderr.

## Support

Open a GitHub issue for bugs and feature requests. Include the extension version,
Zed version, Redmine version, relevant configuration flags, and sanitized MCP
server logs.

For vulnerability reports or credential exposure concerns, follow
[SECURITY.md](SECURITY.md).
