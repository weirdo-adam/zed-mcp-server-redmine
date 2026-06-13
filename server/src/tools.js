import { RedmineError, parseBoolean } from "./redmine.js";

const readLimit = {
  type: "integer",
  minimum: 1,
  maximum: 100,
  default: 25,
};

const silentWriteProperties = {
  silent: {
    type: "boolean",
    description:
      "Override REDMINE_SILENT_WRITES for this call. When true, return compact output and pass notify=false.",
  },
  notify: {
    type: "boolean",
    description: "Override the Redmine notify query parameter for this write request.",
  },
};

export class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = "InputError";
  }
}

export const TOOLS = [
  {
    name: "redmine_get_issue",
    description:
      "Get one Redmine issue. Supports native includes for journals, watchers, checklists, relations, attachments, children, and changesets.",
    inputSchema: objectSchema(
      {
        issue_id: integer("Redmine issue ID."),
        include: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "journals",
              "watchers",
              "checklists",
              "relations",
              "attachments",
              "children",
              "changesets",
            ],
          },
          default: ["journals", "watchers", "checklists"],
        },
      },
      ["issue_id"]
    ),
  },
  {
    name: "redmine_list_issues",
    description: "List Redmine issues with common Redmine REST filters.",
    inputSchema: objectSchema({
      project_id: stringOrInteger("Project identifier or numeric ID."),
      status_id: stringOrInteger("Status filter such as open, closed, *, or a numeric status ID."),
      tracker_id: integer("Tracker ID."),
      assigned_to_id: stringOrInteger("Assignee ID, me, or none."),
      fixed_version_id: stringOrInteger("Version ID, none, or *."),
      query_id: integer("Saved query ID."),
      sort: { type: "string" },
      offset: { type: "integer", minimum: 0 },
      limit: readLimit,
    }),
  },
  {
    name: "redmine_update_issue",
    description:
      "Update a Redmine issue, including notes and checklists_attributes for the Redmine Checklists plugin.",
    inputSchema: objectSchema(
      {
        issue_id: integer("Redmine issue ID."),
        fields: {
          type: "object",
          description:
            "Issue payload fields, for example status_id, assigned_to_id, notes, custom_fields, or checklists_attributes.",
          additionalProperties: true,
        },
        ...silentWriteProperties,
      },
      ["issue_id", "fields"]
    ),
  },
  {
    name: "redmine_list_checklists",
    description: "List checklist items for an issue using the Redmine Checklists plugin include.",
    inputSchema: objectSchema(
      {
        issue_id: integer("Redmine issue ID."),
      },
      ["issue_id"]
    ),
  },
  {
    name: "redmine_add_checklist_item",
    description: "Add a checklist item to a Redmine issue.",
    inputSchema: objectSchema(
      {
        issue_id: integer("Redmine issue ID."),
        subject: { type: "string", minLength: 1 },
        is_done: { type: "boolean" },
        position: integer("Checklist position."),
        ...silentWriteProperties,
      },
      ["issue_id", "subject"]
    ),
  },
  {
    name: "redmine_update_checklist_item",
    description: "Update a checklist item on a Redmine issue.",
    inputSchema: objectSchema(
      {
        issue_id: integer("Redmine issue ID."),
        checklist_id: integer("Checklist item ID."),
        subject: { type: "string" },
        is_done: { type: "boolean" },
        position: integer("Checklist position."),
        ...silentWriteProperties,
      },
      ["issue_id", "checklist_id"]
    ),
  },
  {
    name: "redmine_delete_checklist_item",
    description: "Delete a checklist item from a Redmine issue.",
    inputSchema: objectSchema(
      {
        issue_id: integer("Redmine issue ID."),
        checklist_id: integer("Checklist item ID."),
        ...silentWriteProperties,
      },
      ["issue_id", "checklist_id"]
    ),
  },
  {
    name: "redmine_list_time_entries",
    description: "List Redmine time entries by issue, project, user, date range, or activity.",
    inputSchema: objectSchema({
      issue_id: integer("Issue ID."),
      project_id: stringOrInteger("Project identifier or numeric ID."),
      user_id: stringOrInteger("User ID or me."),
      activity_id: integer("Time entry activity ID."),
      from: { type: "string", description: "Start date YYYY-MM-DD." },
      to: { type: "string", description: "End date YYYY-MM-DD." },
      offset: { type: "integer", minimum: 0 },
      limit: readLimit,
    }),
  },
  {
    name: "redmine_add_time_entry",
    description: "Add a Redmine time entry to an issue or project.",
    inputSchema: objectSchema(
      {
        issue_id: integer("Issue ID."),
        project_id: stringOrInteger("Project identifier or numeric ID."),
        spent_on: { type: "string", description: "Date YYYY-MM-DD." },
        hours: { type: "number", exclusiveMinimum: 0 },
        activity_id: integer("Time entry activity ID."),
        comments: { type: "string" },
        user_id: integer("User ID."),
        ...silentWriteProperties,
      },
      ["hours"]
    ),
  },
  {
    name: "redmine_update_time_entry",
    description: "Update a Redmine time entry.",
    inputSchema: objectSchema(
      {
        time_entry_id: integer("Time entry ID."),
        fields: {
          type: "object",
          additionalProperties: true,
          description: "Time entry fields such as hours, spent_on, activity_id, comments, issue_id, or project_id.",
        },
        ...silentWriteProperties,
      },
      ["time_entry_id", "fields"]
    ),
  },
  {
    name: "redmine_delete_time_entry",
    description: "Delete a Redmine time entry.",
    inputSchema: objectSchema(
      {
        time_entry_id: integer("Time entry ID."),
        ...silentWriteProperties,
      },
      ["time_entry_id"]
    ),
  },
  {
    name: "redmine_list_versions",
    description: "List versions for a Redmine project.",
    inputSchema: objectSchema(
      {
        project_id: stringOrInteger("Project identifier or numeric ID."),
      },
      ["project_id"]
    ),
  },
  {
    name: "redmine_get_version",
    description: "Get one Redmine version.",
    inputSchema: objectSchema(
      {
        version_id: integer("Version ID."),
      },
      ["version_id"]
    ),
  },
  {
    name: "redmine_create_version",
    description: "Create a Redmine project version.",
    inputSchema: objectSchema(
      {
        project_id: stringOrInteger("Project identifier or numeric ID."),
        name: { type: "string", minLength: 1 },
        description: { type: "string" },
        effective_date: { type: "string", description: "Date YYYY-MM-DD." },
        status: { type: "string", enum: ["open", "locked", "closed"] },
        sharing: {
          type: "string",
          enum: ["none", "descendants", "hierarchy", "tree", "system"],
        },
        wiki_page_title: { type: "string" },
        ...silentWriteProperties,
      },
      ["project_id", "name"]
    ),
  },
  {
    name: "redmine_update_version",
    description: "Update a Redmine version.",
    inputSchema: objectSchema(
      {
        version_id: integer("Version ID."),
        fields: {
          type: "object",
          additionalProperties: true,
          description: "Version fields such as name, description, status, sharing, effective_date, or wiki_page_title.",
        },
        ...silentWriteProperties,
      },
      ["version_id", "fields"]
    ),
  },
  {
    name: "redmine_delete_version",
    description: "Delete a Redmine version.",
    inputSchema: objectSchema(
      {
        version_id: integer("Version ID."),
        ...silentWriteProperties,
      },
      ["version_id"]
    ),
  },
  {
    name: "redmine_list_watchers",
    description: "List watchers for a Redmine issue.",
    inputSchema: objectSchema(
      {
        issue_id: integer("Redmine issue ID."),
      },
      ["issue_id"]
    ),
  },
  {
    name: "redmine_add_watcher",
    description: "Add a watcher to a Redmine issue.",
    inputSchema: objectSchema(
      {
        issue_id: integer("Redmine issue ID."),
        user_id: integer("User ID to add as watcher."),
        ...silentWriteProperties,
      },
      ["issue_id", "user_id"]
    ),
  },
  {
    name: "redmine_remove_watcher",
    description: "Remove a watcher from a Redmine issue.",
    inputSchema: objectSchema(
      {
        issue_id: integer("Redmine issue ID."),
        user_id: integer("Watcher user ID."),
        ...silentWriteProperties,
      },
      ["issue_id", "user_id"]
    ),
  },
  {
    name: "redmine_list_time_entry_activities",
    description: "List Redmine time entry activities.",
    inputSchema: objectSchema({}),
  },
  {
    name: "redmine_list_projects",
    description: "List Redmine projects.",
    inputSchema: objectSchema({
      offset: { type: "integer", minimum: 0 },
      limit: readLimit,
    }),
  },
  {
    name: "redmine_list_issue_statuses",
    description: "List Redmine issue statuses.",
    inputSchema: objectSchema({}),
  },
  {
    name: "redmine_list_users",
    description: "List Redmine users, optionally filtered by name.",
    inputSchema: objectSchema({
      name: { type: "string" },
      group_id: integer("Group ID."),
      status: integer("User status."),
      offset: { type: "integer", minimum: 0 },
      limit: readLimit,
    }),
  },
];

const handlers = {
  async redmine_get_issue(client, args) {
    const issueId = required(args, "issue_id");
    return unwrap(
      await client.request("GET", `/issues/${encodeURIComponent(issueId)}.json`, {
        query: {
          include: args.include || ["journals", "watchers", "checklists"],
        },
      })
    );
  },

  async redmine_list_issues(client, args) {
    return unwrap(await client.request("GET", "/issues.json", { query: filterArgs(args) }));
  },

  async redmine_update_issue(client, args) {
    const issueId = required(args, "issue_id");
    const fields = objectArg(args, "fields");
    const response = await client.request("PUT", `/issues/${encodeURIComponent(issueId)}.json`, {
      query: writeQuery(client, args),
      body: { issue: fields },
    });
    return writeResult(client, args, "update_issue", { issue_id: issueId }, response);
  },

  async redmine_list_checklists(client, args) {
    const issueId = required(args, "issue_id");
    const response = await client.request("GET", `/issues/${encodeURIComponent(issueId)}.json`, {
      query: { include: "checklists" },
    });
    const issue = response.body && response.body.issue ? response.body.issue : {};
    return {
      issue_id: issueId,
      checklists: issue.checklists || [],
    };
  },

  async redmine_add_checklist_item(client, args) {
    const issueId = required(args, "issue_id");
    const checklist = pickDefined(args, ["subject", "is_done", "position"]);
    const response = await updateChecklist(client, args, issueId, checklist);
    return writeResult(client, args, "add_checklist_item", { issue_id: issueId }, response);
  },

  async redmine_update_checklist_item(client, args) {
    const issueId = required(args, "issue_id");
    const checklistId = required(args, "checklist_id");
    const checklist = {
      id: checklistId,
      ...pickDefined(args, ["subject", "is_done", "position"]),
    };
    const response = await updateChecklist(client, args, issueId, checklist);
    return writeResult(
      client,
      args,
      "update_checklist_item",
      { issue_id: issueId, checklist_id: checklistId },
      response
    );
  },

  async redmine_delete_checklist_item(client, args) {
    const issueId = required(args, "issue_id");
    const checklistId = required(args, "checklist_id");
    const response = await updateChecklist(client, args, issueId, {
      id: checklistId,
      _destroy: true,
    });
    return writeResult(
      client,
      args,
      "delete_checklist_item",
      { issue_id: issueId, checklist_id: checklistId },
      response
    );
  },

  async redmine_list_time_entries(client, args) {
    return unwrap(await client.request("GET", "/time_entries.json", { query: filterArgs(args) }));
  },

  async redmine_add_time_entry(client, args) {
    if (args.issue_id === undefined && args.project_id === undefined) {
      throw new InputError("Either issue_id or project_id is required");
    }
    const timeEntry = pickDefined(args, [
      "issue_id",
      "project_id",
      "spent_on",
      "hours",
      "activity_id",
      "comments",
      "user_id",
    ]);
    const response = await client.request("POST", "/time_entries.json", {
      query: writeQuery(client, args),
      body: { time_entry: timeEntry },
    });
    return writeResult(client, args, "add_time_entry", targetFrom(timeEntry), response);
  },

  async redmine_update_time_entry(client, args) {
    const timeEntryId = required(args, "time_entry_id");
    const fields = objectArg(args, "fields");
    const response = await client.request(
      "PUT",
      `/time_entries/${encodeURIComponent(timeEntryId)}.json`,
      {
        query: writeQuery(client, args),
        body: { time_entry: fields },
      }
    );
    return writeResult(client, args, "update_time_entry", { time_entry_id: timeEntryId }, response);
  },

  async redmine_delete_time_entry(client, args) {
    const timeEntryId = required(args, "time_entry_id");
    const response = await client.request(
      "DELETE",
      `/time_entries/${encodeURIComponent(timeEntryId)}.json`,
      { query: writeQuery(client, args) }
    );
    return writeResult(client, args, "delete_time_entry", { time_entry_id: timeEntryId }, response);
  },

  async redmine_list_versions(client, args) {
    const projectId = required(args, "project_id");
    return unwrap(
      await client.request("GET", `/projects/${encodeURIComponent(projectId)}/versions.json`)
    );
  },

  async redmine_get_version(client, args) {
    const versionId = required(args, "version_id");
    return unwrap(await client.request("GET", `/versions/${encodeURIComponent(versionId)}.json`));
  },

  async redmine_create_version(client, args) {
    const projectId = required(args, "project_id");
    const version = pickDefined(args, [
      "name",
      "description",
      "effective_date",
      "status",
      "sharing",
      "wiki_page_title",
    ]);
    const response = await client.request(
      "POST",
      `/projects/${encodeURIComponent(projectId)}/versions.json`,
      {
        query: writeQuery(client, args),
        body: { version },
      }
    );
    return writeResult(client, args, "create_version", { project_id: projectId }, response);
  },

  async redmine_update_version(client, args) {
    const versionId = required(args, "version_id");
    const fields = objectArg(args, "fields");
    const response = await client.request("PUT", `/versions/${encodeURIComponent(versionId)}.json`, {
      query: writeQuery(client, args),
      body: { version: fields },
    });
    return writeResult(client, args, "update_version", { version_id: versionId }, response);
  },

  async redmine_delete_version(client, args) {
    const versionId = required(args, "version_id");
    const response = await client.request(
      "DELETE",
      `/versions/${encodeURIComponent(versionId)}.json`,
      { query: writeQuery(client, args) }
    );
    return writeResult(client, args, "delete_version", { version_id: versionId }, response);
  },

  async redmine_list_watchers(client, args) {
    const issueId = required(args, "issue_id");
    const response = await client.request("GET", `/issues/${encodeURIComponent(issueId)}.json`, {
      query: { include: "watchers" },
    });
    const issue = response.body && response.body.issue ? response.body.issue : {};
    return {
      issue_id: issueId,
      watchers: issue.watchers || [],
    };
  },

  async redmine_add_watcher(client, args) {
    const issueId = required(args, "issue_id");
    const userId = required(args, "user_id");
    const response = await client.request(
      "POST",
      `/issues/${encodeURIComponent(issueId)}/watchers.json`,
      {
        query: writeQuery(client, args),
        body: { user_id: userId },
      }
    );
    return writeResult(client, args, "add_watcher", { issue_id: issueId, user_id: userId }, response);
  },

  async redmine_remove_watcher(client, args) {
    const issueId = required(args, "issue_id");
    const userId = required(args, "user_id");
    const response = await client.request(
      "DELETE",
      `/issues/${encodeURIComponent(issueId)}/watchers/${encodeURIComponent(userId)}.json`,
      { query: writeQuery(client, args) }
    );
    return writeResult(
      client,
      args,
      "remove_watcher",
      { issue_id: issueId, user_id: userId },
      response
    );
  },

  async redmine_list_time_entry_activities(client) {
    return unwrap(await client.request("GET", "/enumerations/time_entry_activities.json"));
  },

  async redmine_list_projects(client, args) {
    return unwrap(await client.request("GET", "/projects.json", { query: filterArgs(args) }));
  },

  async redmine_list_issue_statuses(client) {
    return unwrap(await client.request("GET", "/issue_statuses.json"));
  },

  async redmine_list_users(client, args) {
    return unwrap(await client.request("GET", "/users.json", { query: filterArgs(args) }));
  },
};

export function listTools() {
  return TOOLS;
}

export async function callTool(client, name, args = {}) {
  const handler = handlers[name];
  if (!handler) {
    throw new InputError(`Unknown tool: ${name}`);
  }
  return handler(client, args || {});
}

export function toolErrorPayload(error) {
  if (error instanceof RedmineError) {
    return {
      ok: false,
      error: error.message,
      status: error.status,
      method: error.method,
      path: error.path,
      details: error.details,
    };
  }
  return {
    ok: false,
    error: error.message || String(error),
  };
}

async function updateChecklist(client, args, issueId, checklist) {
  return client.request("PUT", `/issues/${encodeURIComponent(issueId)}.json`, {
    query: writeQuery(client, args),
    body: {
      issue: {
        checklists_attributes: [checklist],
      },
    },
  });
}

function writeResult(client, args, operation, target, response) {
  if (isSilentWrite(client, args)) {
    return {
      ok: true,
      operation,
      target,
      status: response.status,
    };
  }
  return {
    ok: true,
    operation,
    target,
    status: response.status,
    response: response.body,
  };
}

function isSilentWrite(client, args) {
  if (args.silent !== undefined) {
    return parseBoolean(args.silent, false);
  }
  return Boolean(client.config && client.config.silentWrites);
}

function writeQuery(client, args) {
  if (args.notify !== undefined) {
    return { notify: parseBoolean(args.notify, true) ? "true" : "false" };
  }
  if (isSilentWrite(client, args)) {
    return { notify: "false" };
  }
  return {};
}

function filterArgs(args) {
  const ignored = new Set(["silent", "notify", "fields"]);
  const result = {};
  for (const [key, value] of Object.entries(args || {})) {
    if (!ignored.has(key) && value !== undefined && value !== null && value !== "") {
      result[key] = value;
    }
  }
  return result;
}

function pickDefined(source, keys) {
  const result = {};
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      result[key] = source[key];
    }
  }
  return result;
}

function required(args, key) {
  if (args[key] === undefined || args[key] === null || args[key] === "") {
    throw new InputError(`${key} is required`);
  }
  return args[key];
}

function objectArg(args, key) {
  const value = required(args, key);
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new InputError(`${key} must be an object`);
  }
  return value;
}

function unwrap(response) {
  return response.body;
}

function targetFrom(value) {
  return pickDefined(value, ["issue_id", "project_id", "user_id"]);
}

function objectSchema(properties, required = []) {
  return {
    type: "object",
    additionalProperties: false,
    properties,
    required,
  };
}

function integer(description) {
  return {
    type: "integer",
    description,
  };
}

function stringOrInteger(description) {
  return {
    oneOf: [{ type: "string" }, { type: "integer" }],
    description,
  };
}
