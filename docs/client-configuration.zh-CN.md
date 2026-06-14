# 客户端配置

本扩展会下载匹配当前平台的 `redmine-mcp-server` GitHub Release 二进制，并将其作为
Zed `redmine` context server 启动。

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

## 配置优先级

扩展按以下顺序向 server 传递环境变量：

1. Zed `settings`
2. Zed `command.env`
3. Zed 进程继承到的环境变量

Zed `settings` 中的空字符串会被忽略。

## 手动 Server 路径

仅在需要使用手动安装的 server 时设置 `command`：

```json
{
  "context_servers": {
    "redmine": {
      "command": "/opt/homebrew/bin/redmine-mcp-server"
    }
  }
}
```

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `REDMINE_BASE_URL` | 无 | Redmine 实例地址。 |
| `REDMINE_API_KEY` | 无 | Redmine REST API key。 |
| `REDMINE_MCP_READ_ONLY` | `true` | 隐藏并拒绝写工具。 |
| `REDMINE_MCP_ENABLE_DELETES` | `false` | 暴露删除和移除工具。 |
| `REDMINE_TIMEOUT_MS` | `30000` | HTTP 请求超时时间，单位毫秒。 |
| `REDMINE_MCP_ATTACHMENT_MAX_BYTES` | `10485760` | 附件下载最大字节数。 |
| `REDMINE_MCP_DISABLE_ATTACHMENTS` | `false` | 禁用附件工具。 |
| `REDMINE_MCP_DISABLE_CHECKLISTS` | `false` | 禁用 Redmine Checklists 工具。 |
| `REDMINE_MCP_DISABLE_RELATIONS` | `false` | 禁用问题关联工具。 |
| `REDMINE_MCP_DISABLE_TIME_ENTRIES` | `false` | 禁用工时工具。 |
| `REDMINE_MCP_DISABLE_VERSIONS` | `false` | 禁用版本工具。 |
| `REDMINE_MCP_DISABLE_WATCHERS` | `false` | 禁用关注者工具。 |
| `REDMINE_MCP_DISABLE_WIKI` | `false` | 禁用 Wiki 工具。 |
