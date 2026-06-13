# Agent Client Configuration

This repository provides two entrypoints:

- Zed extension: installed through Zed's extension registry and started by Zed.
- Standalone stdio MCP server: started with `node server/index.js` by any MCP
  client that supports local stdio servers.

The Zed extension is the primary distribution. Standalone stdio usage is a
supported secondary path for local agent development tools.

Use absolute paths when configuring external clients. Store API keys in
user-scoped client settings or environment variables, not in committed project
files.

## Local Startup

From the repository root:

```sh
export REDMINE_BASE_URL="https://redmine.example.com"
export REDMINE_API_KEY="your-api-key"
export REDMINE_MCP_READ_ONLY=true
npm start
```

The server speaks newline-delimited JSON-RPC over stdin/stdout. It waits for MCP
client messages and does not print a startup banner.

Smoke test:

```sh
export REDMINE_BASE_URL="https://redmine.example.com"
export REDMINE_API_KEY="your-api-key"
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  | npm start
```

## One-Command Local Install

Install the standalone server into a user directory and create a launcher:

```sh
scripts/install-local.sh
```

Default install directory:

```text
~/.local/share/redmine-mcp-server
```

Override the install directory with `REDMINE_MCP_INSTALL_DIR`:

```sh
REDMINE_MCP_INSTALL_DIR="$HOME/.local/share/redmine-mcp-server" scripts/install-local.sh
```

After installation, external clients can use:

```text
~/.local/share/redmine-mcp-server/bin/redmine-mcp-server
```

## Zed Extension

When installed as a Zed extension, configure the bundled `redmine` context
server in Zed settings:

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

Zed starts the bundled server with Zed's Node.js runtime.

## Zed Custom Command

For local development or a checkout that is not installed from the extension
registry, point Zed at the standalone server:

```json
{
  "context_servers": {
    "redmine": {
      "command": {
        "path": "node",
        "arguments": [
          "/absolute/path/to/zed-mcp-server-redmine/server/index.js"
        ],
        "env": {
          "REDMINE_BASE_URL": "https://redmine.example.com",
          "REDMINE_API_KEY": "your-api-key",
          "REDMINE_MCP_READ_ONLY": "true"
        }
      }
    }
  }
}
```

## Claude Code

Claude Code can register a local stdio MCP server with `claude mcp add`:

```sh
claude mcp add --transport stdio redmine \
  --env REDMINE_BASE_URL=https://redmine.example.com \
  --env REDMINE_API_KEY=your-api-key \
  --env REDMINE_MCP_READ_ONLY=true \
  -- node /absolute/path/to/zed-mcp-server-redmine/server/index.js
```

For a project-scoped configuration, use `.mcp.json` and keep secrets in
environment variables:

```json
{
  "mcpServers": {
    "redmine": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/absolute/path/to/zed-mcp-server-redmine/server/index.js"
      ],
      "env": {
        "REDMINE_BASE_URL": "https://redmine.example.com",
        "REDMINE_API_KEY": "${REDMINE_API_KEY}",
        "REDMINE_MCP_READ_ONLY": "true"
      }
    }
  }
}
```

## Claude Desktop

Add the server to the user-level Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "redmine": {
      "command": "node",
      "args": [
        "/absolute/path/to/zed-mcp-server-redmine/server/index.js"
      ],
      "env": {
        "REDMINE_BASE_URL": "https://redmine.example.com",
        "REDMINE_API_KEY": "your-api-key",
        "REDMINE_MCP_READ_ONLY": "true"
      }
    }
  }
}
```

Restart Claude Desktop after changing the configuration.

## Codex

Codex clients that support local stdio MCP servers can use a TOML server entry
in the user or project Codex configuration:

```toml
[mcp_servers.redmine]
command = "node"
args = ["/absolute/path/to/zed-mcp-server-redmine/server/index.js"]

[mcp_servers.redmine.env]
REDMINE_BASE_URL = "https://redmine.example.com"
REDMINE_API_KEY = "your-api-key"
REDMINE_MCP_READ_ONLY = "true"
```

Prefer user-scoped configuration for real API keys. Use project-scoped
configuration only with environment-variable indirection or read-only test
credentials.

## Other MCP Clients

Use the same stdio contract:

- Command: `node`
- Arguments: `["/absolute/path/to/zed-mcp-server-redmine/server/index.js"]`
- Required environment: `REDMINE_BASE_URL`, `REDMINE_API_KEY`
- Optional safety setting: `REDMINE_MCP_READ_ONLY=true`
- Optional destructive delete/remove opt-in: `REDMINE_MCP_ENABLE_DELETES=true`
- Optional feature flag example: `REDMINE_MCP_DISABLE_WIKI=true`
- Optional attachment limit: `REDMINE_MCP_ATTACHMENT_MAX_BYTES=10485760`

See [api-coverage.md](api-coverage.md) for the exposed Redmine API scope and
feature flags.

## Releases

GitHub Actions publishes releases from `main`. When the version in
`extension.toml` does not already have a remote tag and GitHub Release, the
release workflow creates `v<version>`, builds the package, and uploads the
archive plus checksum as release assets.

To build the same package locally:

```sh
scripts/package-release.sh
```

The script runs checks, builds `extension.wasm`, and writes
`redmine-mcp-server-<version>.tar.gz` plus a `.sha256` file under `dist/`.

## References

- [Zed MCP extensions](https://zed.dev/docs/extensions/mcp-extensions)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
