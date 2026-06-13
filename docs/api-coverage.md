# Redmine REST API Coverage

This extension focuses on common Redmine workflows for Zed agents. It does not
claim complete Redmine REST API coverage.

## Coverage Status

| Redmine API area | Status | MCP tools |
| --- | --- | --- |
| Issues | Partial | `redmine_list_issues`, `redmine_get_issue`, `redmine_create_issue`, `redmine_update_issue` |
| Search | Supported | `redmine_search` |
| Projects | Partial | `redmine_list_projects` |
| Issue statuses | Supported | `redmine_list_issue_statuses` |
| Users | Partial | `redmine_list_users` |
| Issue relations | Supported | `redmine_list_issue_relations`, `redmine_get_issue_relation`, `redmine_add_issue_relation`, `redmine_delete_issue_relation` |
| Time entries | Partial | `redmine_list_time_entries`, `redmine_add_time_entry`, `redmine_update_time_entry`, `redmine_delete_time_entry`, `redmine_list_time_entry_activities` |
| Versions | Supported | `redmine_list_versions`, `redmine_get_version`, `redmine_create_version`, `redmine_update_version`, `redmine_delete_version` |
| Watchers | Supported | `redmine_list_watchers`, `redmine_add_watcher`, `redmine_remove_watcher` |
| Checklists plugin | Supported when plugin is installed | `redmine_list_checklists`, `redmine_add_checklist_item`, `redmine_update_checklist_item`, `redmine_delete_checklist_item` |
| Trackers | Planned | Not implemented |
| Enumerations and priorities | Planned | Not implemented |
| Issue categories | Planned | Not implemented |
| Custom fields | Planned | Not implemented |
| Saved queries | Planned | Not implemented |
| Current user | Planned | Not implemented |
| Project memberships | Planned, read-only first | Not implemented |
| Attachments | Deferred | Not implemented |
| Wiki pages | Deferred, read-only first | Not implemented |
| News | Deferred | Not implemented |
| Files | Deferred | Not implemented |
| Groups and roles | Deferred | Not implemented |
| Project administration | Deferred | Not implemented |
| User administration | Deferred | Not implemented |

## Current Scope

The current tool set is intended for issue triage, issue updates, time tracking,
milestone/version work, relation management, watcher management, and checklist
workflows.

Administrative APIs and high-impact destructive operations are intentionally not
enabled by default. New write tools must be compatible with
`REDMINE_MCP_READ_ONLY` and should have tests showing that read-only mode blocks
the operation before any Redmine request is made.

## Suggested Contribution Order

1. Metadata read tools:
   `redmine_get_project`, `redmine_list_trackers`,
   `redmine_list_issue_priorities`, `redmine_list_issue_categories`,
   `redmine_list_custom_fields`, `redmine_list_queries`,
   `redmine_get_current_user`.
2. Existing group completion:
   `redmine_get_time_entry`.
3. Optional read-only groups:
   project memberships and wiki pages.
4. High-risk write/admin tools only after an explicit design discussion.
