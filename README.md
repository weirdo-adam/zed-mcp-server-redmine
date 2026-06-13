<p align="center">
  <img src="docs/assets/readme-hero.svg" alt="Redmine MCP Server for Zed" width="100%">
</p>

<p align="center">
  <a href="README.zh-CN.md">简体中文</a>
  ·
  <a href="docs/client-configuration.md">Client configuration</a>
  ·
  <a href="docs/api-coverage.md">API coverage</a>
  ·
  <a href="SECURITY.md">Security</a>
</p>

# Redmine MCP Server for Zed

A Zed extension that registers a `redmine` MCP context server and runs the
bundled stdio MCP server with Zed's Node.js runtime. The bundled
`server/index.js` entrypoint can also run as a local MCP server for agent
development tools that support stdio MCP servers.

<p>
  <img alt="Version 0.1.0" src="https://img.shields.io/badge/version-0.1.0-f25f4c">
  <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-19c37d">
  <img alt="Node 18.17 or newer" src="https://img.shields.io/badge/node-%3E%3D18.17-243447">
  <img alt="Zed MCP extension" src="https://img.shields.io/badge/Zed-MCP_extension-7dd3fc">
</p>

## Project Positioning

- Primary distribution: Zed extension with a bundled Redmine stdio MCP server.
- Standalone distribution: `redmine-mcp-server` for Homebrew and other MCP
  clients.
- The bundled server keeps the Zed extension self-contained. Homebrew installs
  live in a separate path and do not conflict with the extension.
- Package status: this repository is not published as an npm package; npm
  scripts are for local development, installation, and testing.

## Requirements

- Redmine with REST API access enabled.
- A Redmine API key with the required project permissions.
- Redmine Checklists plugin, only for checklist tools.

## Installation

### Zed Extension

Published builds are installed through Zed's extension registry. For local
development, clone this repository and load it through Zed's development
extension workflow.

Zed starts `server/index.js` with its bundled Node.js runtime. A separate Node.js
installation is only required for local development or standalone server tests.

### Standalone MCP Server

For Claude, Codex, Cursor, and other MCP clients, use the standalone
`redmine-mcp-server` distribution. Its Homebrew formula should point at the
standalone server release, not this Zed extension repository:

```sh
brew install weirdo-adam/tap/redmine-mcp-server
```

Then configure clients to run `redmine-mcp-server` with the required
`REDMINE_*` environment variables.

The local install script is a development fallback when working from this
checkout:

```sh
scripts/install-local.sh
```

### Zed With Homebrew Server

The Zed extension uses the bundled server by default. To force Zed to use a
Homebrew-installed server instead, override the command:

```json
{
  "context_servers": {
    "redmine": {
      "command": {
        "path": "/opt/homebrew/bin/redmine-mcp-server",
        "arguments": []
      },
      "settings": {
        "REDMINE_BASE_URL": "https://redmine.example.com",
        "REDMINE_API_KEY": "your-api-key",
        "REDMINE_MCP_READ_ONLY": false
      }
    }
  }
}
```

Use `/usr/local/bin/redmine-mcp-server` on Intel macOS Homebrew installations.

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
| `REDMINE_MCP_ENABLE_DELETES` | No | `false` | Expose destructive delete/remove tools. Delete and remove tools are disabled by default. |
| `REDMINE_MCP_DISABLE_ATTACHMENTS` | No | `false` | Disable attachment tools. |
| `REDMINE_MCP_DISABLE_CHECKLISTS` | No | `false` | Disable checklist tools. |
| `REDMINE_MCP_DISABLE_RELATIONS` | No | `false` | Disable issue relation tools. |
| `REDMINE_MCP_DISABLE_TIME_ENTRIES` | No | `false` | Disable time entry tools. |
| `REDMINE_MCP_DISABLE_VERSIONS` | No | `false` | Disable version tools. |
| `REDMINE_MCP_DISABLE_WIKI` | No | `false` | Disable wiki page tools. |
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
`redmine-mcp-server` with the `REDMINE_*` environment variables.

See [docs/client-configuration.md](docs/client-configuration.md) for client
configuration examples.

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
status and unsupported areas.

| Group | Tools | Availability | Notes |
| --- | --- | --- | --- |
| Issues | `redmine_list_issues`, `redmine_get_issue`, `redmine_create_issue`, `redmine_update_issue`, `redmine_delete_issue` | Core issue tools are always enabled. `redmine_delete_issue` requires `REDMINE_MCP_ENABLE_DELETES=true`. | Write tools are hidden in read-only mode. Issue deletion is destructive and disabled by default. |
| Search and metadata | `redmine_search`, `redmine_list_projects`, `redmine_get_project`, `redmine_list_project_memberships`, `redmine_get_project_membership`, `redmine_list_issue_statuses`, `redmine_list_trackers`, `redmine_list_issue_priorities`, `redmine_list_issue_categories`, `redmine_list_custom_fields`, `redmine_list_queries`, `redmine_list_users`, `redmine_get_current_user` | Always enabled | Read-only. Project membership tools are read-only. |
| Attachments | `redmine_get_attachment`, `redmine_download_attachment`, `redmine_upload_attachment`, `redmine_delete_attachment` | Disable with `REDMINE_MCP_DISABLE_ATTACHMENTS=true`. `redmine_delete_attachment` also requires `REDMINE_MCP_ENABLE_DELETES=true`. | Upload and opt-in delete are hidden in read-only mode. Download returns base64 or UTF-8 text. Attachment deletion is destructive and disabled by default. |
| Wiki pages | `redmine_list_wiki_pages`, `redmine_get_wiki_page` | Disable with `REDMINE_MCP_DISABLE_WIKI=true`. | Read-only. Supports listing pages and reading a page by title or version. |
| Issue relations | `redmine_list_issue_relations`, `redmine_get_issue_relation`, `redmine_add_issue_relation`, `redmine_delete_issue_relation` | Disable with `REDMINE_MCP_DISABLE_RELATIONS=true`. Delete requires `REDMINE_MCP_ENABLE_DELETES=true`. | Write tools are hidden in read-only mode. |
| Checklists | `redmine_list_checklists`, `redmine_add_checklist_item`, `redmine_update_checklist_item`, `redmine_delete_checklist_item` | Disable with `REDMINE_MCP_DISABLE_CHECKLISTS=true`. Delete requires `REDMINE_MCP_ENABLE_DELETES=true`. | Requires Redmine Checklists. |
| Time entries | `redmine_list_time_entries`, `redmine_get_time_entry`, `redmine_add_time_entry`, `redmine_update_time_entry`, `redmine_delete_time_entry`, `redmine_list_time_entry_activities` | Disable with `REDMINE_MCP_DISABLE_TIME_ENTRIES=true`. Delete requires `REDMINE_MCP_ENABLE_DELETES=true`. | Write tools are hidden in read-only mode. |
| Versions | `redmine_list_versions`, `redmine_get_version`, `redmine_create_version`, `redmine_update_version`, `redmine_delete_version` | Disable with `REDMINE_MCP_DISABLE_VERSIONS=true`. Delete requires `REDMINE_MCP_ENABLE_DELETES=true`. | Write tools are hidden in read-only mode. |
| Watchers | `redmine_list_watchers`, `redmine_add_watcher`, `redmine_remove_watcher` | Disable with `REDMINE_MCP_DISABLE_WATCHERS=true`. Remove requires `REDMINE_MCP_ENABLE_DELETES=true`. | Write tools are hidden in read-only mode. |

## Development

```sh
scripts/check.sh
```

The check script runs JavaScript syntax checks, Node.js tests, Rust formatting,
Rust clippy, and the Zed WASI target check.

The MCP stdio transport uses newline-delimited JSON-RPC on stdout. Logs and
diagnostics must be written to stderr.

## Publishing

This repository does not publish a plugin tarball. Zed extension publishing is
handled through Zed's extension registry, where the extension entry points at a
repository commit and Zed builds the extension package.

Standalone `redmine-mcp-server` GitHub Releases and Homebrew formula updates
belong to the standalone server distribution, not this plugin repository.

## Support

Use GitHub Issues for defects and feature requests. Include the extension
version, Zed version, Redmine version, relevant configuration flags, and
sanitized MCP server logs.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md) before
opening pull requests or sensitive reports.
