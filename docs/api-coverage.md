# Redmine REST API Coverage

This extension covers common Redmine workflows for Zed agents. It is not a
complete Redmine REST API implementation.

Status definitions:

- Supported: core Redmine REST endpoints for this area are exposed.
- Partial: only selected endpoints or safe read-only operations are exposed.
- Planned: useful for this MCP server, but not implemented yet.
- Not supported: not currently targeted for this extension.

## Coverage Status

| Redmine API area | Status | MCP tools | Notes |
| --- | --- | --- | --- |
| Issues | Partial | `redmine_list_issues`, `redmine_get_issue`, `redmine_create_issue`, `redmine_update_issue` | `redmine_delete_issue` is not implemented. |
| Search | Supported | `redmine_search` | Read-only. |
| Projects | Partial | `redmine_list_projects`, `redmine_get_project` | Read-only project lookup. Project create/update/delete is not implemented. |
| Project memberships | Planned | Not implemented | Read-only support should be added before write operations. |
| Issue statuses | Supported | `redmine_list_issue_statuses` | Read-only. |
| Trackers | Supported | `redmine_list_trackers` | Read-only. |
| Enumerations and priorities | Partial | `redmine_list_issue_priorities`, `redmine_list_time_entry_activities` | Document categories are not exposed. |
| Issue categories | Partial | `redmine_list_issue_categories` | Read-only list by project. Category create/update/delete is not implemented. |
| Custom fields | Supported | `redmine_list_custom_fields` | Redmine requires administrator privileges for this endpoint. |
| Saved queries | Supported | `redmine_list_queries` | Lists queries visible to the API user. |
| Users | Partial | `redmine_list_users`, `redmine_get_current_user` | User administration is not implemented. |
| Groups | Not supported | Not implemented | No current plan. |
| Roles | Not supported | Not implemented | No current plan. |
| Issue relations | Supported | `redmine_list_issue_relations`, `redmine_get_issue_relation`, `redmine_add_issue_relation`, `redmine_delete_issue_relation` | Write tools are disabled by `REDMINE_MCP_READ_ONLY=true`. |
| Time entries | Supported | `redmine_list_time_entries`, `redmine_get_time_entry`, `redmine_add_time_entry`, `redmine_update_time_entry`, `redmine_delete_time_entry`, `redmine_list_time_entry_activities` | Can be disabled with `REDMINE_MCP_DISABLE_TIME_ENTRIES=true`. |
| Versions | Supported | `redmine_list_versions`, `redmine_get_version`, `redmine_create_version`, `redmine_update_version`, `redmine_delete_version` | Can be disabled with `REDMINE_MCP_DISABLE_VERSIONS=true`. |
| Watchers | Supported | `redmine_list_watchers`, `redmine_add_watcher`, `redmine_remove_watcher` | Can be disabled with `REDMINE_MCP_DISABLE_WATCHERS=true`. |
| Attachments | Planned | Not implemented | Upload/download handling is intentionally deferred. |
| Wiki pages | Planned | Not implemented | Read-only support is the recommended first step. |
| News | Not supported | Not implemented | No current plan. |
| Files | Not supported | Not implemented | No current plan. |
| Project administration | Not supported | Not implemented | High-impact administrative operations are out of scope. |
| User administration | Not supported | Not implemented | High-impact administrative operations are out of scope. |
| Checklists plugin | Supported | `redmine_list_checklists`, `redmine_add_checklist_item`, `redmine_update_checklist_item`, `redmine_delete_checklist_item` | Requires the Redmine Checklists plugin. Can be disabled with `REDMINE_MCP_DISABLE_CHECKLISTS=true`. |

## Scope Rules

The default tool set prioritizes issue triage, metadata lookup, time tracking,
versions, relations, watchers, and checklists. Optional tool groups are enabled
by default and can be disabled with `REDMINE_MCP_DISABLE_*` environment
variables.

Administrative APIs and high-impact destructive operations are intentionally not
part of the first publish scope. New write tools must be compatible with
`REDMINE_MCP_READ_ONLY` and must have tests proving that read-only mode blocks
the operation before any Redmine request is made.

## Recommended Next Additions

1. Project memberships read-only tools.
2. Wiki pages read-only tools behind a dedicated feature flag.
3. Attachment upload/download after file transport and security behavior are
   designed.
4. `redmine_delete_issue`, only if documented as destructive and guarded by
   `REDMINE_MCP_READ_ONLY`.

## References

- [Redmine REST API](https://www.redmine.org/projects/redmine/wiki/Rest_api)
- [Redmine REST Time Entries](https://www.redmine.org/projects/redmine/wiki/Rest_TimeEntries)
- [Redmine REST Projects](https://www.redmine.org/projects/redmine/wiki/Rest_Projects)
