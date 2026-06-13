# Redmine MCP Server for Zed

[English](README.md)

这个 Zed 插件遵循 Zed 的
[MCP 扩展模型](https://zed.dev/docs/extensions/mcp-extensions)，注册一个
`redmine` MCP context server，并启动内置的 Node.js stdio MCP server。

## 配置

安装 Zed 插件后，在 Zed `settings.json` 中配置 Redmine context server：

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

插件会把 Zed settings 映射为内置服务端使用的标准 `REDMINE_*` 环境变量。
在 Zed 之外单独运行服务端时，也可以直接使用同名环境变量。

可选工具组默认开启。使用 `REDMINE_MCP_DISABLE_*` 配置可以减少暴露的工具集，
或禁用依赖未安装 Redmine 插件的功能。

| 变量 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `REDMINE_BASE_URL` | 是 | 无 | Redmine 实例地址，例如 `https://redmine.example.com`。 |
| `REDMINE_API_KEY` | 是 | 无 | Redmine REST API key。 |
| `REDMINE_MCP_READ_ONLY` | 否 | `false` | 开启只读模式。写工具会从 `tools/list` 中隐藏，即使被直接调用也会被拒绝。 |
| `REDMINE_MCP_DISABLE_CHECKLISTS` | 否 | `false` | 禁用检查清单工具。开启检查清单工具时需要安装 `redmine_checklists` 插件。 |
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

`REDMINE_MCP_READ_ONLY=true` 会禁用全部写工具。`REDMINE_SILENT_WRITES=true`
只改变写入通知和返回内容，不会阻止写操作。写工具也支持通过 `silent` 和
`notify` 参数进行单次调用级别的覆盖。

## 可用工具

Core Features 默认始终开启。

问题：

- `redmine_list_issues` - 按 Redmine 过滤条件列出问题。
- `redmine_create_issue` - 创建问题。
- `redmine_get_issue` - 获取问题详情。
- `redmine_update_issue` - 更新问题，并可按需抑制邮件通知。

搜索和元数据：

- `redmine_search` - 在 Redmine 中搜索。
- `redmine_list_projects` - 列出项目。
- `redmine_list_issue_statuses` - 列出问题状态。
- `redmine_list_users` - 列出用户。

Optional Features 默认开启，并可按分组单独禁用。

问题关联：

- `redmine_list_issue_relations` - 列出问题关联。
- `redmine_get_issue_relation` - 获取单个问题关联。
- `redmine_add_issue_relation` - 创建问题关联。
- `redmine_delete_issue_relation` - 删除问题关联。
- 使用 `REDMINE_MCP_DISABLE_RELATIONS=true` 禁用。

检查清单：

- `redmine_list_checklists` - 列出问题的检查清单。
- `redmine_add_checklist_item` - 添加检查清单项。
- `redmine_update_checklist_item` - 更新检查清单项。
- `redmine_delete_checklist_item` - 删除检查清单项。
- 需要 `redmine_checklists` 插件。使用 `REDMINE_MCP_DISABLE_CHECKLISTS=true` 禁用。

工时：

- `redmine_list_time_entries` - 按过滤条件列出工时。
- `redmine_add_time_entry` - 创建工时。
- `redmine_update_time_entry` - 更新工时。
- `redmine_delete_time_entry` - 删除工时。
- `redmine_list_time_entry_activities` - 列出工时活动。
- 使用 `REDMINE_MCP_DISABLE_TIME_ENTRIES=true` 禁用。

版本：

- `redmine_list_versions` - 列出项目版本/里程碑。
- `redmine_get_version` - 获取版本。
- `redmine_create_version` - 创建版本。
- `redmine_update_version` - 更新版本。
- `redmine_delete_version` - 删除版本。
- 使用 `REDMINE_MCP_DISABLE_VERSIONS=true` 禁用。

关注者：

- `redmine_list_watchers` - 列出问题关注者。
- `redmine_add_watcher` - 添加关注者。
- `redmine_remove_watcher` - 移除关注者。
- 使用 `REDMINE_MCP_DISABLE_WATCHERS=true` 禁用。

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
