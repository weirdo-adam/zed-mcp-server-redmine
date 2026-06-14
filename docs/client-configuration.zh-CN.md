# 客户端配置

本扩展启动本机已安装的 `redmine-mcp-server` 可执行文件。扩展不内置、不下载
server。

先安装 server：

```sh
brew install weirdo-adam/tap/redmine-mcp-server
```

## Zed

macOS 下扩展默认使用标准 Homebrew 路径：

- Apple Silicon：`/opt/homebrew/bin/redmine-mcp-server`
- Intel：`/usr/local/bin/redmine-mcp-server`

如果 server 安装在其他位置，显式设置 `command`：

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

如果 `redmine-mcp-server` 在其他平台存在于 Zed 进程继承到的环境中，可以省略
`command` 配置。通过 GUI 启动的 Zed 通常不会读取 `.zshrc`。

## 配置优先级

扩展按以下顺序向 server 传递环境变量：

1. Zed `settings`
2. Zed `command.env`
3. Zed 进程继承到的环境变量

Zed `settings` 中的空字符串会被忽略，因此可回退到 Zed 进程继承的环境变量。

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

## 其他客户端

Claude、Codex 和其他 MCP 客户端示例由独立 server 仓库维护：

```text
https://github.com/weirdo-adam/redmine-mcp-server
```
