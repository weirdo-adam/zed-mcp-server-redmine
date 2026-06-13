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

test("tool list includes native checklist, time entry, version, and watcher tools", () => {
  const names = new Set(listTools().map((tool) => tool.name));
  assert.ok(names.has("redmine_list_checklists"));
  assert.ok(names.has("redmine_add_time_entry"));
  assert.ok(names.has("redmine_list_versions"));
  assert.ok(names.has("redmine_add_watcher"));
});

test("config reads REDMINE_* values from the environment", () => {
  const config = createConfig({
    REDMINE_BASE_URL: "https://redmine.example.com/",
    REDMINE_API_KEY: "secret",
    REDMINE_READ_ONLY: "true",
    REDMINE_SILENT_WRITES: "yes",
    REDMINE_TIMEOUT_MS: "15000",
  });

  assert.equal(config.baseUrl, "https://redmine.example.com");
  assert.equal(config.apiKey, "secret");
  assert.equal(config.readOnly, true);
  assert.equal(config.silentWrites, true);
  assert.equal(config.timeoutMs, 15000);
});

test("read-only mode hides write tools and keeps read tools visible", () => {
  const names = new Set(listTools({ readOnly: true }).map((tool) => tool.name));
  assert.ok(names.has("redmine_get_issue"));
  assert.ok(names.has("redmine_list_checklists"));
  assert.ok(names.has("redmine_list_time_entries"));
  assert.ok(names.has("redmine_list_versions"));
  assert.ok(names.has("redmine_list_watchers"));
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
    /REDMINE_READ_ONLY is enabled/
  );
  assert.equal(requests.length, 0);
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
