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

Zed extension that registers a `redmine` MCP context server and starts the
bundled Redmine stdio MCP server with Zed's Node.js runtime.

The standalone server is distributed separately as `redmine-mcp-server`. This
repository only maintains the Zed extension.

<p>
  <img alt="Version 0.1.0" src="https://img.shields.io/badge/version-0.1.0-f25f4c">
  <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-19c37d">
  <img alt="Node 18.17 or newer" src="https://img.shields.io/badge/node-%3E%3D18.17-243447">
  <img alt="Zed MCP extension" src="https://img.shields.io/badge/Zed-MCP_extension-7dd3fc">
</p>

## Requirements

- Zed with MCP extension support
- Redmine REST API enabled
- Redmine API key with the required project permissions
- Redmine Checklists plugin, only when checklist tools are used

## Installation

Install the extension from Zed's extension registry after publication.

For local development, clone this repository and load it with Zed's development
extension workflow. The extension uses the bundled `server/index.js`; no
separate server installation is required.

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

Common settings:

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `REDMINE_BASE_URL` | Yes | none | Redmine base URL. |
| `REDMINE_API_KEY` | Yes | none | Redmine REST API key. |
| `REDMINE_MCP_READ_ONLY` | No | `false` | Hide and reject write tools. |
| `REDMINE_MCP_ENABLE_DELETES` | No | `false` | Expose destructive delete/remove tools. |
| `REDMINE_TIMEOUT_MS` | No | `30000` | HTTP request timeout in milliseconds. |

Additional feature flags and external client examples are documented in
[docs/client-configuration.md](docs/client-configuration.md).

## Tools

The extension exposes Redmine tools for issues, projects, metadata, attachments,
wiki pages, issue relations, checklists, time entries, versions, and watchers.

See [docs/api-coverage.md](docs/api-coverage.md) for the supported API surface.

## Development

```sh
scripts/check.sh
```

The check script runs JavaScript validation, Node.js tests, Rust formatting,
Clippy, and the Zed WASI target check.

## Publishing

This repository does not publish a plugin tarball. Zed extension publishing is
handled through Zed's extension registry.

## Security

Permissions are determined by the configured Redmine API key. Use the least
privileged key practical for the target project, and enable
`REDMINE_MCP_READ_ONLY=true` when write operations are not required.

See [SECURITY.md](SECURITY.md) for vulnerability reporting.
