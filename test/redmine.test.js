import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";

import { buildUrl, createConfig, createRedmineClient } from "../server/src/redmine.js";
import { callTool, listTools } from "../server/src/tools.js";

test("buildUrl trims base URL and serializes array query values", () => {
  assert.equal(
    buildUrl("https://redmine.example.com/", "/issues/42.json", {
      include: ["watchers", "checklists"],
    }),
    "https://redmine.example.com/issues/42.json?include=watchers%2Cchecklists"
  );
});

test("tool list includes core and optional Redmine tools", () => {
  const names = new Set(listTools().map((tool) => tool.name));
  assert.ok(names.has("redmine_create_issue"));
  assert.ok(names.has("redmine_search"));
  assert.ok(names.has("redmine_get_project"));
  assert.ok(names.has("redmine_list_trackers"));
  assert.ok(names.has("redmine_list_issue_priorities"));
  assert.ok(names.has("redmine_list_issue_categories"));
  assert.ok(names.has("redmine_list_custom_fields"));
  assert.ok(names.has("redmine_list_queries"));
  assert.ok(names.has("redmine_get_current_user"));
  assert.ok(names.has("redmine_list_checklists"));
  assert.ok(names.has("redmine_list_issue_relations"));
  assert.ok(names.has("redmine_add_time_entry"));
  assert.ok(names.has("redmine_get_time_entry"));
  assert.ok(names.has("redmine_list_versions"));
  assert.ok(names.has("redmine_add_watcher"));
});

test("config reads REDMINE_* values from the environment", () => {
  const config = createConfig({
    REDMINE_BASE_URL: "https://redmine.example.com/",
    REDMINE_API_KEY: "secret",
    REDMINE_MCP_READ_ONLY: "true",
    REDMINE_MCP_DISABLE_CHECKLISTS: "true",
    REDMINE_MCP_DISABLE_RELATIONS: "1",
    REDMINE_MCP_DISABLE_TIME_ENTRIES: "yes",
    REDMINE_MCP_DISABLE_VERSIONS: "on",
    REDMINE_MCP_DISABLE_WATCHERS: "true",
    REDMINE_SILENT_WRITES: "yes",
    REDMINE_TIMEOUT_MS: "15000",
  });

  assert.equal(config.baseUrl, "https://redmine.example.com");
  assert.equal(config.apiKey, "secret");
  assert.equal(config.readOnly, true);
  assert.deepEqual(config.disabledFeatures, {
    checklists: true,
    relations: true,
    timeEntries: true,
    versions: true,
    watchers: true,
  });
  assert.equal(config.silentWrites, true);
  assert.equal(config.timeoutMs, 15000);
});

test("legacy REDMINE_READ_ONLY is not supported", () => {
  const config = createConfig({
    REDMINE_BASE_URL: "https://redmine.example.com/",
    REDMINE_API_KEY: "secret",
    REDMINE_READ_ONLY: "true",
  });

  assert.equal(config.readOnly, false);
});

test("read-only mode hides write tools and keeps read tools visible", () => {
  const names = new Set(listTools({ readOnly: true }).map((tool) => tool.name));
  assert.ok(names.has("redmine_get_issue"));
  assert.ok(names.has("redmine_search"));
  assert.ok(names.has("redmine_list_checklists"));
  assert.ok(names.has("redmine_list_time_entries"));
  assert.ok(names.has("redmine_get_time_entry"));
  assert.ok(names.has("redmine_list_versions"));
  assert.ok(names.has("redmine_list_watchers"));
  assert.equal(names.has("redmine_create_issue"), false);
  assert.equal(names.has("redmine_update_issue"), false);
  assert.equal(names.has("redmine_add_time_entry"), false);
  assert.equal(names.has("redmine_create_version"), false);
  assert.equal(names.has("redmine_add_watcher"), false);
});

test("read-only mode rejects direct write tool calls before Redmine requests", async () => {
  const requests = [];
  const client = createClient(requests, { readOnly: true });

  await assert.rejects(
    () =>
      callTool(client, "redmine_update_issue", {
        issue_id: 42,
        fields: {
          notes: "blocked",
        },
      }),
    /REDMINE_MCP_READ_ONLY is enabled/
  );
  assert.equal(requests.length, 0);
});

test("feature disable flags hide grouped tools", () => {
  const names = new Set(
    listTools({
      disabledFeatures: {
        checklists: true,
        relations: true,
        timeEntries: true,
        versions: true,
        watchers: true,
      },
    }).map((tool) => tool.name)
  );

  assert.ok(names.has("redmine_get_issue"));
  assert.equal(names.has("redmine_list_checklists"), false);
  assert.equal(names.has("redmine_list_issue_relations"), false);
  assert.equal(names.has("redmine_list_time_entries"), false);
  assert.equal(names.has("redmine_get_time_entry"), false);
  assert.equal(names.has("redmine_list_time_entry_activities"), false);
  assert.equal(names.has("redmine_list_versions"), false);
  assert.equal(names.has("redmine_list_watchers"), false);
});

test("feature disable flags reject direct tool calls before Redmine requests", async () => {
  const requests = [];
  const client = createClient(requests, {
    disabledFeatures: {
      relations: true,
    },
  });

  await assert.rejects(
    () =>
      callTool(client, "redmine_add_issue_relation", {
        issue_id: 42,
        issue_to_id: 43,
        relation_type: "relates",
      }),
    /REDMINE_MCP_DISABLE_RELATIONS is enabled/
  );
  assert.equal(requests.length, 0);
});

test("disabled issue features are removed from default get issue includes", async () => {
  const requests = [];
  const client = createClient(requests, {
    disabledFeatures: {
      checklists: true,
      relations: true,
      watchers: true,
    },
  });

  await callTool(client, "redmine_get_issue", {
    issue_id: 42,
  });

  assert.equal(requests[0].url, "https://redmine.example.com/issues/42.json?include=journals");
});

test("search targets the native Redmine search endpoint", async () => {
  const requests = [];
  const client = createClient(requests);

  await callTool(client, "redmine_search", {
    q: "upgrade",
    issues: true,
    open_issues: true,
    limit: 10,
  });

  const url = new URL(requests[0].url);
  assert.equal(url.pathname, "/search.json");
  assert.equal(url.searchParams.get("q"), "upgrade");
  assert.equal(url.searchParams.get("issues"), "true");
  assert.equal(url.searchParams.get("open_issues"), "true");
  assert.equal(url.searchParams.get("limit"), "10");
});

test("metadata tools target native Redmine REST endpoints", async () => {
  const requests = [];
  const client = createClient(requests);

  await callTool(client, "redmine_get_project", {
    project_id: "demo",
    include: ["trackers", "issue_categories"],
  });
  await callTool(client, "redmine_list_trackers");
  await callTool(client, "redmine_list_issue_priorities");
  await callTool(client, "redmine_list_issue_categories", {
    project_id: "demo",
  });
  await callTool(client, "redmine_list_custom_fields");
  await callTool(client, "redmine_list_queries", {
    project_id: "demo",
  });
  await callTool(client, "redmine_get_current_user", {
    include: ["memberships", "groups"],
  });

  assert.equal(
    requests[0].url,
    "https://redmine.example.com/projects/demo.json?include=trackers%2Cissue_categories"
  );
  assert.equal(requests[1].url, "https://redmine.example.com/trackers.json");
  assert.equal(
    requests[2].url,
    "https://redmine.example.com/enumerations/issue_priorities.json"
  );
  assert.equal(
    requests[3].url,
    "https://redmine.example.com/projects/demo/issue_categories.json"
  );
  assert.equal(requests[4].url, "https://redmine.example.com/custom_fields.json");

  const queriesUrl = new URL(requests[5].url);
  assert.equal(queriesUrl.pathname, "/queries.json");
  assert.equal(queriesUrl.searchParams.get("project_id"), "demo");

  assert.equal(
    requests[6].url,
    "https://redmine.example.com/users/current.json?include=memberships%2Cgroups"
  );
});

test("time entry read tools target Redmine time entry endpoints", async () => {
  const requests = [];
  const client = createClient(requests);

  await callTool(client, "redmine_get_time_entry", {
    time_entry_id: 7,
  });

  assert.equal(requests[0].url, "https://redmine.example.com/time_entries/7.json");
  assert.equal(requests[0].request.method, "GET");
});

test("issue creation targets the Redmine issues endpoint", async () => {
  const requests = [];
  const client = createClient(requests);

  const result = await callTool(client, "redmine_create_issue", {
    project_id: "demo",
    subject: "Create issue from MCP",
    description: "Created by test",
    priority_id: 3,
    fields: {
      tracker_id: 2,
    },
    silent: true,
  });

  assert.deepEqual(result, {
    ok: true,
    operation: "create_issue",
    target: {
      project_id: "demo",
    },
    status: 201,
  });
  assert.equal(requests[0].url, "https://redmine.example.com/issues.json?notify=false");
  assert.equal(requests[0].request.method, "POST");
  assert.deepEqual(JSON.parse(requests[0].request.body), {
    issue: {
      tracker_id: 2,
      project_id: "demo",
      subject: "Create issue from MCP",
      description: "Created by test",
      priority_id: 3,
    },
  });
});

test("write silent mode returns compact output and passes notify=false", async () => {
  const requests = [];
  const client = createClient(requests, { silentWrites: true });

  const result = await callTool(client, "redmine_add_time_entry", {
    issue_id: 42,
    hours: 1.5,
    activity_id: 9,
    comments: "Investigation",
  });

  assert.deepEqual(result, {
    ok: true,
    operation: "add_time_entry",
    target: { issue_id: 42 },
    status: 201,
  });
  assert.equal(requests[0].url, "https://redmine.example.com/time_entries.json?notify=false");
  assert.equal(requests[0].request.method, "POST");
  assert.equal(requests[0].request.headers["X-Redmine-API-Key"], "secret");
  assert.deepEqual(JSON.parse(requests[0].request.body), {
    time_entry: {
      issue_id: 42,
      hours: 1.5,
      activity_id: 9,
      comments: "Investigation",
    },
  });
});

test("issue relation creation targets Redmine relations endpoint", async () => {
  const requests = [];
  const client = createClient(requests);

  const result = await callTool(client, "redmine_add_issue_relation", {
    issue_id: 42,
    issue_to_id: 43,
    relation_type: "relates",
    silent: true,
  });

  assert.deepEqual(result, {
    ok: true,
    operation: "add_issue_relation",
    target: {
      issue_id: 42,
      issue_to_id: 43,
      relation_type: "relates",
    },
    status: 201,
  });
  assert.equal(requests[0].url, "https://redmine.example.com/issues/42/relations.json?notify=false");
  assert.deepEqual(JSON.parse(requests[0].request.body), {
    relation: {
      issue_to_id: 43,
      relation_type: "relates",
    },
  });
});

test("checklist update uses Redmine checklists_attributes payload", async () => {
  const requests = [];
  const client = createClient(requests);

  const result = await callTool(client, "redmine_update_checklist_item", {
    issue_id: 42,
    checklist_id: 7,
    is_done: true,
    silent: true,
  });

  assert.equal(result.operation, "update_checklist_item");
  assert.equal(requests[0].url, "https://redmine.example.com/issues/42.json?notify=false");
  assert.deepEqual(JSON.parse(requests[0].request.body), {
    issue: {
      checklists_attributes: [
        {
          id: 7,
          is_done: true,
        },
      ],
    },
  });
});

test("version creation targets the project versions endpoint", async () => {
  const requests = [];
  const client = createClient(requests);

  const result = await callTool(client, "redmine_create_version", {
    project_id: "demo",
    name: "1.2.0",
    effective_date: "2026-07-01",
    status: "open",
  });

  assert.equal(result.operation, "create_version");
  assert.equal(requests[0].url, "https://redmine.example.com/projects/demo/versions.json");
  assert.deepEqual(JSON.parse(requests[0].request.body), {
    version: {
      name: "1.2.0",
      effective_date: "2026-07-01",
      status: "open",
    },
  });
});

test("watcher addition targets the issue watchers endpoint", async () => {
  const requests = [];
  const client = createClient(requests);

  const result = await callTool(client, "redmine_add_watcher", {
    issue_id: 42,
    user_id: 9,
    silent: true,
  });

  assert.deepEqual(result, {
    ok: true,
    operation: "add_watcher",
    target: {
      issue_id: 42,
      user_id: 9,
    },
    status: 201,
  });
  assert.equal(requests[0].url, "https://redmine.example.com/issues/42/watchers.json?notify=false");
  assert.deepEqual(JSON.parse(requests[0].request.body), {
    user_id: 9,
  });
});

test("MCP stdio server answers initialize and tools/list with newline JSON-RPC", async () => {
  const child = spawn(process.execPath, ["server/index.js"], {
    cwd: new URL("..", import.meta.url),
    env: {
      ...process.env,
      REDMINE_BASE_URL: "https://redmine.example.com",
      REDMINE_API_KEY: "secret",
    },
    stdio: ["pipe", "pipe", "pipe"],
  });

  const responses = [];
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    for (const line of chunk.split("\n")) {
      if (line.trim()) {
        responses.push(JSON.parse(line));
      }
    }
  });

  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize" })}\n`);
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" })}\n`);

  await waitFor(() => responses.length === 2);
  child.kill();

  assert.equal(responses[0].result.serverInfo.name, "redmine");
  assert.ok(responses[1].result.tools.some((tool) => tool.name === "redmine_list_watchers"));
});

function createClient(requests, overrides = {}) {
  return createRedmineClient({
    baseUrl: "https://redmine.example.com/",
    apiKey: "secret",
    readOnly: false,
    disabledFeatures: {
      checklists: false,
      relations: false,
      timeEntries: false,
      versions: false,
      watchers: false,
    },
    timeoutMs: 30000,
    silentWrites: false,
    fetchImpl: async (url, request) => {
      requests.push({ url, request });
      return new Response(JSON.stringify({ ok: true }), {
        status: request.method === "POST" ? 201 : 200,
        headers: { "content-type": "application/json" },
      });
    },
    ...overrides,
  });
}

async function waitFor(predicate) {
  const deadline = Date.now() + 2000;
  while (Date.now() < deadline) {
    if (predicate()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error("timed out waiting for condition");
}
