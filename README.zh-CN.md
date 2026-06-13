# Redmine MCP Server for Zed

[English](README.md)

这个扩展遵循 Zed 的
[MCP 扩展模型](https://zed.dev/docs/extensions/mcp-extensions)，注册一个
`redmine` MCP context server，并运行内置的 Node.js stdio MCP server。

## 配置

将本目录作为 Zed dev extension 安装后，在 Zed `settings.json` 中配置：

```json
{
  "context_servers": {
    "redmine": {
      "settings": {
        "REDMINE_BASE_URL": "https://redmine.example.com",
        "REDMINE_API_KEY": "your-api-key",
        "REDMINE_MCP_READ_ONLY": false,
        "REDMINE_MCP_DISABLE_CHECKLISTS": false,
        "REDMINE_MCP_DISABLE_RELATIONS": false,
        "REDMINE_MCP_DISABLE_TIME_ENTRIES": false,
        "REDMINE_MCP_DISABLE_VERSIONS": false,
        "REDMINE_MCP_DISABLE_WATCHERS": false,
        "REDMINE_SILENT_WRITES": false,
        "REDMINE_TIMEOUT_MS": 30000
      }
    }
  }
}
```

扩展会把 Zed settings 中的配置转换成标准 `REDMINE_*` 环境变量传给内置
服务端。服务端本身也会直接读取同名进程环境变量，因此同一个 server 也可以
在 Zed 之外独立运行。

Zed settings 和进程环境变量中都推荐使用下面这些 `REDMINE_*` 键。扩展会把
Zed settings 中的值传给内置服务端作为环境变量。

| 变量 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `REDMINE_BASE_URL` | 是 | 无 | Redmine 实例地址，例如 `https://redmine.example.com`。 |
| `REDMINE_API_KEY` | 是 | 无 | Redmine REST API key。 |
| `REDMINE_MCP_READ_ONLY` | 否 | `false` | 开启只读模式。写工具会从 `tools/list` 中隐藏，即使被直接调用也会被拒绝。 |
| `REDMINE_MCP_DISABLE_CHECKLISTS` | 否 | `false` | 禁用检查清单工具。只有安装了 `redmine_checklists` 插件时才应保持 `false`。 |
| `REDMINE_MCP_DISABLE_RELATIONS` | 否 | `false` | 禁用问题关联工具。 |
| `REDMINE_MCP_DISABLE_TIME_ENTRIES` | 否 | `false` | 禁用工时工具。 |
| `REDMINE_MCP_DISABLE_VERSIONS` | 否 | `false` | 禁用版本/里程碑工具。 |
| `REDMINE_MCP_DISABLE_WATCHERS` | 否 | `false` | 禁用关注者工具。 |
| `REDMINE_SILENT_WRITES` | 否 | `false` | 写工具返回更精简的成功结果，并在 Redmine 写请求中附加 `notify=false`。 |
| `REDMINE_TIMEOUT_MS` | 否 | `30000` | HTTP 请求超时时间，单位毫秒。 |

只通过环境变量运行的示例：

```sh
export REDMINE_BASE_URL="https://redmine.example.com"
export REDMINE_API_KEY="your-api-key"
export REDMINE_MCP_READ_ONLY=true
node server/index.js
```

`REDMINE_MCP_READ_ONLY=true` 适合只允许 agent 查看 Redmine、禁止任何变更的
场景。`REDMINE_SILENT_WRITES=true` 只改变写入通知和返回内容，不会阻止写操作。
每个写操作工具也支持通过 `silent` 和 `notify` 参数进行单次调用级别的覆盖。

## 工具能力

服务端提供以下 Redmine 工具：

- 问题：获取、列表、更新。
- 问题关联：列表、获取、添加、删除。
- 检查清单：通过 `checklists_attributes` 列表、添加、更新、删除。
- 工时：列表、添加、更新、删除，以及工时活动列表。
- 版本：列表、获取、创建、更新、删除。
- 关注者：列表、添加、移除。
- 元数据：项目、问题状态、用户。

## 开发

```sh
npm test
cargo check --target wasm32-wasip2
```

完整本地检查：

```sh
scripts/check.sh
```

MCP stdio transport 使用 stdout 输出按行分隔的 JSON-RPC 消息。日志和诊断
信息必须写入 stderr，避免干扰协议通信。
