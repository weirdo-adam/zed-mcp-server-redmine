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
        "REDMINE_SILENT_WRITES": false,
        "REDMINE_TIMEOUT_MS": 30000
      }
    }
  }
}
```

服务端也会读取同名进程环境变量。扩展层支持 `base_url`、`api_key`、
`silent_writes` 等小写别名，但最终会向服务端传递标准的 `REDMINE_*`
环境变量。

`REDMINE_SILENT_WRITES=true` 会让写操作工具返回更精简的成功结果，并在
Redmine 写请求中附加 `notify=false`。每个写操作工具也支持通过 `silent`
和 `notify` 参数进行单次调用级别的覆盖。

## 工具能力

服务端提供以下 Redmine 工具：

- 问题：获取、列表、更新。
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
