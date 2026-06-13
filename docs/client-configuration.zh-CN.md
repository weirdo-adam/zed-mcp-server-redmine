# Agent 客户端配置

本仓库提供两个入口：

- Zed 扩展：通过 Zed 扩展市场安装，由 Zed 启动。
- 独立 stdio MCP server：由支持本地 stdio MCP 的客户端启动
  `node server/index.js`。

Zed 扩展是主要发布形态。独立 stdio 使用方式是为本地 agent 开发工具提供的
补充路径。

外部客户端配置建议使用绝对路径。API key 应放在用户级客户端配置或环境变量中，
不要提交到项目仓库。

## 本地启动

在仓库根目录执行：

```sh
export REDMINE_BASE_URL="https://redmine.example.com"
export REDMINE_API_KEY="your-api-key"
export REDMINE_MCP_READ_ONLY=true
npm start
```

服务通过 stdin/stdout 使用按行分隔的 JSON-RPC。启动后会等待 MCP 客户端消息，
不会输出启动 banner。

Smoke test：

```sh
export REDMINE_BASE_URL="https://redmine.example.com"
export REDMINE_API_KEY="your-api-key"
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  | npm start
```

## 一键本地安装

安装到用户目录并生成 launcher：

```sh
scripts/install-local.sh
```

默认安装目录：

```text
~/.local/share/redmine-mcp-server
```

可通过 `REDMINE_MCP_INSTALL_DIR` 指定安装目录：

```sh
REDMINE_MCP_INSTALL_DIR="$HOME/.local/share/redmine-mcp-server" scripts/install-local.sh
```

安装完成后，外部客户端可使用：

```text
~/.local/share/redmine-mcp-server/bin/redmine-mcp-server
```

## Zed 扩展

通过 Zed 扩展安装后，在 Zed settings 中配置随附的 `redmine` context server：

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

Zed 会使用内置 Node.js runtime 启动随附 server。

## Zed 自定义命令

本地开发或未通过扩展市场安装时，也可以直接指向独立 server：

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

Claude Code 可通过 `claude mcp add` 注册本地 stdio MCP server：

```sh
claude mcp add --transport stdio redmine \
  --env REDMINE_BASE_URL=https://redmine.example.com \
  --env REDMINE_API_KEY=your-api-key \
  --env REDMINE_MCP_READ_ONLY=true \
  -- node /absolute/path/to/zed-mcp-server-redmine/server/index.js
```

项目级 `.mcp.json` 示例：

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

在用户级 Claude Desktop MCP 配置中添加：

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

修改后重启 Claude Desktop。

## Codex

支持本地 stdio MCP server 的 Codex 客户端可在用户级或项目级配置中添加：

```toml
[mcp_servers.redmine]
command = "node"
args = ["/absolute/path/to/zed-mcp-server-redmine/server/index.js"]

[mcp_servers.redmine.env]
REDMINE_BASE_URL = "https://redmine.example.com"
REDMINE_API_KEY = "your-api-key"
REDMINE_MCP_READ_ONLY = "true"
```

真实 API key 建议放在用户级配置。项目级配置只建议使用环境变量引用或只读测试
凭据。

## 其他 MCP 客户端

使用相同 stdio 约定：

- Command: `node`
- Arguments: `["/absolute/path/to/zed-mcp-server-redmine/server/index.js"]`
- 必填环境变量：`REDMINE_BASE_URL`、`REDMINE_API_KEY`
- 建议安全开关：`REDMINE_MCP_READ_ONLY=true`
- 可选破坏性删除/移除开关：`REDMINE_MCP_ENABLE_DELETES=true`
- 可选功能开关示例：`REDMINE_MCP_DISABLE_WIKI=true`
- 可选附件限制：`REDMINE_MCP_ATTACHMENT_MAX_BYTES=10485760`

已暴露的 Redmine API 范围和 feature flags 见 [api-coverage.md](api-coverage.md)。

## 本地 Release

本地 release 包手动维护：

```sh
scripts/package-release.sh
```

脚本会执行校验、构建 `extension.wasm`、在 `dist/` 下生成
`redmine-mcp-server-<version>.tar.gz` 和 `.sha256`。可将这两个文件作为手动
release assets 发布。

## 参考

- [Zed MCP extensions](https://zed.dev/docs/extensions/mcp-extensions)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
