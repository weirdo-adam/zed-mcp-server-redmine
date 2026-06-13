<p align="center">
  <img src="docs/assets/readme-hero.svg" alt="Redmine MCP Server for Zed" width="100%">
</p>

<p align="center">
  <a href="README.md">English</a>
  ·
  <a href="docs/client-configuration.zh-CN.md">客户端配置</a>
  ·
  <a href="docs/api-coverage.md">API 覆盖</a>
  ·
  <a href="SECURITY.md">安全</a>
</p>

# Redmine MCP Server for Zed

一个 Zed 扩展，用于注册 `redmine` MCP context server，并通过 Zed 内置
Node.js 运行时启动随附的 stdio MCP server。随附的 `server/index.js` 入口
也可以作为本地 MCP server，用于支持 stdio MCP 的 agent 开发工具。

<p>
  <img alt="Version 0.1.0" src="https://img.shields.io/badge/version-0.1.0-f25f4c">
  <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-19c37d">
  <img alt="Node 18.17 or newer" src="https://img.shields.io/badge/node-%3E%3D18.17-243447">
  <img alt="Zed MCP extension" src="https://img.shields.io/badge/Zed-MCP_extension-7dd3fc">
</p>

## 项目定位

- 主要发布形态：Zed 扩展。
- 内置运行时：独立 Redmine stdio MCP server。
- 补充使用方式：Claude、Codex 以及其他 agent 工具的本地 MCP 配置。
- 包状态：本仓库不作为 npm package 发布；npm scripts 用于本地开发、安装和
  手动 release 打包。

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
| `REDMINE_MCP_ENABLE_DELETES` | 否 | `false` | 暴露破坏性删除/移除工具。删除和移除工具默认禁用。 |
| `REDMINE_MCP_DISABLE_ATTACHMENTS` | 否 | `false` | 禁用附件工具。 |
| `REDMINE_MCP_DISABLE_CHECKLISTS` | 否 | `false` | 禁用检查清单工具。 |
| `REDMINE_MCP_DISABLE_RELATIONS` | 否 | `false` | 禁用问题关联工具。 |
| `REDMINE_MCP_DISABLE_TIME_ENTRIES` | 否 | `false` | 禁用工时工具。 |
| `REDMINE_MCP_DISABLE_VERSIONS` | 否 | `false` | 禁用版本工具。 |
| `REDMINE_MCP_DISABLE_WIKI` | 否 | `false` | 禁用 Wiki 页面工具。 |
| `REDMINE_MCP_DISABLE_WATCHERS` | 否 | `false` | 禁用关注者工具。 |
| `REDMINE_MCP_ATTACHMENT_MAX_BYTES` | 否 | `10485760` | MCP 返回的附件上传/下载最大载荷字节数。 |
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

## Agent 客户端配置

本服务使用标准 stdio MCP transport。Zed、Claude Code 或 Claude Desktop、
Codex，以及其他本地 MCP 客户端都可以通过启动
`node /absolute/path/to/server/index.js` 并传入 `REDMINE_*` 环境变量来使用。

客户端配置示例见
[docs/client-configuration.zh-CN.md](docs/client-configuration.zh-CN.md)。

非 Zed MCP 客户端的一键本地安装：

```sh
scripts/install-local.sh
```

## 安全

实际权限由配置的 Redmine API key 决定。建议为目标项目使用最小必要权限；不需要
写操作时，设置 `REDMINE_MCP_READ_ONLY=true`。

不要在公开 issue、pull request、截图或日志中泄露 API key、私有 Redmine 数据或
内部 Redmine 地址。漏洞报告请参考 [SECURITY.md](SECURITY.md)。

## 可用工具

工具 schema 通过 MCP `tools/list` 返回。
Redmine REST API 覆盖状态和未支持范围见
[docs/api-coverage.md](docs/api-coverage.md)。

| 分组 | 工具 | 可用性 | 说明 |
| --- | --- | --- | --- |
| 问题 | `redmine_list_issues`、`redmine_get_issue`、`redmine_create_issue`、`redmine_update_issue`、`redmine_delete_issue` | 核心问题工具始终启用。`redmine_delete_issue` 需要 `REDMINE_MCP_ENABLE_DELETES=true`。 | 写工具在只读模式下隐藏。删除问题是破坏性操作，默认禁用。 |
| 搜索和元数据 | `redmine_search`、`redmine_list_projects`、`redmine_get_project`、`redmine_list_project_memberships`、`redmine_get_project_membership`、`redmine_list_issue_statuses`、`redmine_list_trackers`、`redmine_list_issue_priorities`、`redmine_list_issue_categories`、`redmine_list_custom_fields`、`redmine_list_queries`、`redmine_list_users`、`redmine_get_current_user` | 始终启用 | 只读。项目成员关系工具只提供读取能力。 |
| 附件 | `redmine_get_attachment`、`redmine_download_attachment`、`redmine_upload_attachment`、`redmine_delete_attachment` | 使用 `REDMINE_MCP_DISABLE_ATTACHMENTS=true` 禁用。`redmine_delete_attachment` 还需要 `REDMINE_MCP_ENABLE_DELETES=true`。 | 上传和显式开启的删除工具在只读模式下隐藏；下载返回 base64 或 UTF-8 文本。删除附件是破坏性操作，默认禁用。 |
| Wiki 页面 | `redmine_list_wiki_pages`、`redmine_get_wiki_page` | 使用 `REDMINE_MCP_DISABLE_WIKI=true` 禁用。 | 只读。支持列出页面，以及按标题或版本读取页面。 |
| 问题关联 | `redmine_list_issue_relations`、`redmine_get_issue_relation`、`redmine_add_issue_relation`、`redmine_delete_issue_relation` | 使用 `REDMINE_MCP_DISABLE_RELATIONS=true` 禁用。删除需要 `REDMINE_MCP_ENABLE_DELETES=true`。 | 写工具在只读模式下隐藏。 |
| 检查清单 | `redmine_list_checklists`、`redmine_add_checklist_item`、`redmine_update_checklist_item`、`redmine_delete_checklist_item` | 使用 `REDMINE_MCP_DISABLE_CHECKLISTS=true` 禁用。删除需要 `REDMINE_MCP_ENABLE_DELETES=true`。 | 需要 Redmine Checklists。 |
| 工时 | `redmine_list_time_entries`、`redmine_get_time_entry`、`redmine_add_time_entry`、`redmine_update_time_entry`、`redmine_delete_time_entry`、`redmine_list_time_entry_activities` | 使用 `REDMINE_MCP_DISABLE_TIME_ENTRIES=true` 禁用。删除需要 `REDMINE_MCP_ENABLE_DELETES=true`。 | 写工具在只读模式下隐藏。 |
| 版本 | `redmine_list_versions`、`redmine_get_version`、`redmine_create_version`、`redmine_update_version`、`redmine_delete_version` | 使用 `REDMINE_MCP_DISABLE_VERSIONS=true` 禁用。删除需要 `REDMINE_MCP_ENABLE_DELETES=true`。 | 写工具在只读模式下隐藏。 |
| 关注者 | `redmine_list_watchers`、`redmine_add_watcher`、`redmine_remove_watcher` | 使用 `REDMINE_MCP_DISABLE_WATCHERS=true` 禁用。移除需要 `REDMINE_MCP_ENABLE_DELETES=true`。 | 写工具在只读模式下隐藏。 |

## 开发

```sh
scripts/check.sh
```

检查脚本会执行 JavaScript 语法检查、Node.js 测试、Rust 格式检查、Rust clippy
以及 Zed WASI target 检查。

MCP stdio transport 使用 stdout 输出按行分隔的 JSON-RPC 消息。日志和诊断信息
必须写入 stderr。

## Release

GitHub Actions 会从 `main` 自动发布 release。当 `extension.toml` 中的版本还
没有对应的远端 tag 和 GitHub Release 时，release workflow 会创建
`v<version>`、构建发布包，并上传 archive 和校验文件。

本地也可以构建同样的发布包：

```sh
scripts/package-release.sh
```

发布包包含 Zed 扩展文件、独立 MCP server、文档和本地安装脚本。

## 支持

缺陷和功能请求请提交 GitHub Issue。请附上扩展版本、Zed 版本、Redmine 版本、
相关配置开关，以及脱敏后的 MCP server 日志。

提交 pull request 或敏感问题前，请参考 [CONTRIBUTING.md](CONTRIBUTING.md) 和
[SECURITY.md](SECURITY.md)。
