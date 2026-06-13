# Redmine MCP Server for Zed

[English](README.md)

一个 Zed 扩展，用于注册 `redmine` MCP context server，并通过 Zed 内置
Node.js 运行时启动随附的 stdio MCP server。

## 运行要求

- Redmine 已开启 REST API。
- Redmine API key 具备目标项目所需权限。
- Redmine Checklists 插件仅在启用检查清单工具时需要。

## 安装

发布版本通过 Zed 扩展市场安装。本地开发时，clone 本仓库并按 Zed 开发扩展流程
从本地 checkout 加载。

Zed 会使用内置 Node.js 运行时启动 `server/index.js`。只有本地开发或单独测试
stdio server 时才需要额外安装 Node.js。

## 配置

在 Zed settings 中配置 `redmine` context server：

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

配置会映射为服务端使用的 `REDMINE_*` 环境变量。可选工具组默认启用。

| 变量 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `REDMINE_BASE_URL` | 是 | 无 | Redmine 实例地址。 |
| `REDMINE_API_KEY` | 是 | 无 | Redmine REST API key。 |
| `REDMINE_MCP_READ_ONLY` | 否 | `false` | 隐藏并拒绝写工具。 |
| `REDMINE_MCP_DISABLE_CHECKLISTS` | 否 | `false` | 禁用检查清单工具。 |
| `REDMINE_MCP_DISABLE_RELATIONS` | 否 | `false` | 禁用问题关联工具。 |
| `REDMINE_MCP_DISABLE_TIME_ENTRIES` | 否 | `false` | 禁用工时工具。 |
| `REDMINE_MCP_DISABLE_VERSIONS` | 否 | `false` | 禁用版本工具。 |
| `REDMINE_MCP_DISABLE_WATCHERS` | 否 | `false` | 禁用关注者工具。 |
| `REDMINE_SILENT_WRITES` | 否 | `false` | 返回精简写入结果，并发送 `notify=false`。 |
| `REDMINE_TIMEOUT_MS` | 否 | `30000` | HTTP 请求超时时间，单位毫秒。 |

写工具也支持通过 `silent` 和 `notify` 参数按单次调用覆盖。

本地 stdio server 示例：

```sh
export REDMINE_BASE_URL="https://redmine.example.com"
export REDMINE_API_KEY="your-api-key"
export REDMINE_MCP_READ_ONLY=true
node server/index.js
```

## 安全

实际权限由配置的 Redmine API key 决定。建议为目标项目使用最小必要权限；不需要
写操作时，设置 `REDMINE_MCP_READ_ONLY=true`。

不要在公开 issue、pull request、截图或日志中泄露 API key、私有 Redmine 数据或
内部 Redmine 地址。漏洞报告请参考 [SECURITY.md](SECURITY.md)。

## 可用工具

工具 schema 通过 MCP `tools/list` 返回。
Redmine REST API 覆盖状态和计划补充项见
[docs/api-coverage.md](docs/api-coverage.md)。

| 分组 | 工具 | 可用性 | 说明 |
| --- | --- | --- | --- |
| 问题 | `redmine_list_issues`、`redmine_get_issue`、`redmine_create_issue`、`redmine_update_issue` | 始终启用 | 写工具在只读模式下隐藏。 |
| 搜索和元数据 | `redmine_search`、`redmine_list_projects`、`redmine_get_project`、`redmine_list_issue_statuses`、`redmine_list_trackers`、`redmine_list_issue_priorities`、`redmine_list_issue_categories`、`redmine_list_custom_fields`、`redmine_list_queries`、`redmine_list_users`、`redmine_get_current_user` | 始终启用 | 只读。 |
| 问题关联 | `redmine_list_issue_relations`、`redmine_get_issue_relation`、`redmine_add_issue_relation`、`redmine_delete_issue_relation` | 使用 `REDMINE_MCP_DISABLE_RELATIONS=true` 禁用。 | 写工具在只读模式下隐藏。 |
| 检查清单 | `redmine_list_checklists`、`redmine_add_checklist_item`、`redmine_update_checklist_item`、`redmine_delete_checklist_item` | 使用 `REDMINE_MCP_DISABLE_CHECKLISTS=true` 禁用。 | 需要 Redmine Checklists。 |
| 工时 | `redmine_list_time_entries`、`redmine_get_time_entry`、`redmine_add_time_entry`、`redmine_update_time_entry`、`redmine_delete_time_entry`、`redmine_list_time_entry_activities` | 使用 `REDMINE_MCP_DISABLE_TIME_ENTRIES=true` 禁用。 | 写工具在只读模式下隐藏。 |
| 版本 | `redmine_list_versions`、`redmine_get_version`、`redmine_create_version`、`redmine_update_version`、`redmine_delete_version` | 使用 `REDMINE_MCP_DISABLE_VERSIONS=true` 禁用。 | 写工具在只读模式下隐藏。 |
| 关注者 | `redmine_list_watchers`、`redmine_add_watcher`、`redmine_remove_watcher` | 使用 `REDMINE_MCP_DISABLE_WATCHERS=true` 禁用。 | 写工具在只读模式下隐藏。 |

## 开发

```sh
scripts/check.sh
```

检查脚本会执行 JavaScript 语法检查、Node.js 测试、Rust 格式检查、Rust clippy
以及 Zed WASI target 检查。

MCP stdio transport 使用 stdout 输出按行分隔的 JSON-RPC 消息。日志和诊断信息
必须写入 stderr。

## 支持

缺陷和功能请求请提交 GitHub Issue。请附上扩展版本、Zed 版本、Redmine 版本、
相关配置开关，以及脱敏后的 MCP server 日志。

提交 pull request 或敏感问题前，请参考 [CONTRIBUTING.md](CONTRIBUTING.md) 和
[SECURITY.md](SECURITY.md)。
