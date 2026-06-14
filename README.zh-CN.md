# Redmine MCP Server for Zed

用于 Zed 的 Redmine MCP 扩展。扩展注册 `redmine` MCP context server，并启动本机
已安装的独立 `redmine-mcp-server` 可执行文件。

本仓库只维护 Zed 扩展。Server 实现、GitHub Releases 和 Homebrew formula 由
[`weirdo-adam/redmine-mcp-server`](https://github.com/weirdo-adam/redmine-mcp-server)
维护。

## 运行要求

- 支持 MCP 扩展的 Zed
- 本机已安装 `redmine-mcp-server`
- Redmine 已开启 REST API
- Redmine API key 具备目标项目所需权限

## 安装 Server

```sh
brew install weirdo-adam/tap/redmine-mcp-server
```

Apple Silicon Homebrew 路径：

```text
/opt/homebrew/bin/redmine-mcp-server
```

Intel macOS Homebrew 路径：

```text
/usr/local/bin/redmine-mcp-server
```

## Zed 配置

macOS 下扩展默认使用标准 Homebrew 路径：

- Apple Silicon：`/opt/homebrew/bin/redmine-mcp-server`
- Intel：`/usr/local/bin/redmine-mcp-server`

如果 server 安装在其他位置，显式设置 `command`。

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

配置优先级：

1. Zed `settings`
2. Zed `command.env`
3. Zed 进程继承到的环境变量

Zed `settings` 中的空字符串不会传给 server，因此可回退到 Zed 进程继承的环境
变量。从 Dock 或 Spotlight 启动 Zed 时，`.zshrc` 中的环境变量通常不可用。

## 配置项

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `REDMINE_BASE_URL` | 无 | Redmine 实例地址。 |
| `REDMINE_API_KEY` | 无 | Redmine REST API key。 |
| `REDMINE_MCP_READ_ONLY` | `true` | 隐藏并拒绝写工具。 |
| `REDMINE_MCP_ENABLE_DELETES` | `false` | 暴露破坏性删除/移除工具。 |
| `REDMINE_TIMEOUT_MS` | `30000` | HTTP 请求超时时间，单位毫秒。 |

更多 server 配置项见独立 server 仓库。

## 开发

```sh
scripts/check.sh
```

检查脚本会执行 Rust 格式检查、类型检查、Clippy 和 Zed WASI target 检查。

## 发布

本仓库不发布插件 tarball，也不发布 server archive。Zed 扩展发布通过 Zed 扩展市场
完成。Server Releases 和 Homebrew 更新属于独立 server 仓库。

## 安全

实际权限由配置的 Redmine API key 决定。建议为目标项目使用最小必要权限，并将真实
API key 放在用户级 Zed settings 中。

漏洞报告请参考 [SECURITY.md](SECURITY.md)。
