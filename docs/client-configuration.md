# Client Configuration

This extension downloads the matching `redmine-mcp-server` GitHub Release binary
and launches it as the Zed `redmine` context server.

## Zed

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

## Configuration Precedence

The extension passes environment variables to the server in this order:

1. Zed `settings`
2. Zed `command.env`
3. Environment inherited by the Zed process

Empty string values in Zed `settings` are ignored.

## Manual Server Path

Set `command` only when a manually installed server should be used:

```json
{
  "context_servers": {
    "redmine": {
      "command": "/opt/homebrew/bin/redmine-mcp-server"
    }
  }
}
```

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
