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
        "REDMINE_MCP_READ_ONLY": false
      }
    }
  }
}
```

扩展会把 Zed settings 中的配置转换成标准 `REDMINE_*` 环境变量传给内置
服务端。服务端本身也会直接读取同名进程环境变量，因此同一个 server 也可以
在 Zed 之外独立运行。

Zed settings 和进程环境变量中都推荐使用下面这些 `REDMINE_*` 键。扩展会把
Zed settings 中的值传给内置服务端作为环境变量。可选工具组默认开启，只有在
工作流不需要某个分组或缺少插件时，才需要添加 `REDMINE_MCP_DISABLE_*` 配置。

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

`REDMINE_MCP_READ_ONLY=true` 适合只允许 agent 查看 Redmine、禁止任何变更的
场景。`REDMINE_SILENT_WRITES=true` 只改变写入通知和返回内容，不会阻止写操作。
每个写操作工具也支持通过 `silent` 和 `notify` 参数进行单次调用级别的覆盖。

## 可用工具

Core Features 默认始终开启。

问题：

- `redmine_list_issues` - 按 Redmine 过滤条件列出问题。
- `redmine_create_issue` - 创建新问题。
- `redmine_get_issue` - 查看问题详情。
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
