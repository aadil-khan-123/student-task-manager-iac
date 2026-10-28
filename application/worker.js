import indexHtml from "./index.html";
import styleCss from "./style.css";
import scriptJs from "./script.js";

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };
const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Pending", "In Progress", "Completed"];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

const asset = (body, type) =>
  new Response(body, { headers: { "Content-Type": `${type}; charset=utf-8` } });

async function nextId(kv) {
  const { keys } = await kv.list({ prefix: "task:" });
  const max = keys.reduce((m, k) => {
    const n = parseInt(k.name.replace("task:T", ""), 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 100);
  return `T${max + 1}`;
}

function validate(body, partial = false) {
  const errors = [];
  if (!partial || body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) errors.push("title is required");
  }
  if (body.priority !== undefined && !PRIORITIES.includes(body.priority))
    errors.push(`priority must be one of ${PRIORITIES.join(", ")}`);
  if (body.status !== undefined && !STATUSES.includes(body.status))
    errors.push(`status must be one of ${STATUSES.join(", ")}`);
  return errors;
}

async function handleApi(request, env, url) {
  const kv = env.TASKS_KV;
  const parts = url.pathname.split("/").filter(Boolean); // ["api","tasks",id?]
  const id = parts[2];

  let body = {};
  if (["POST", "PUT"].includes(request.method)) {
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }
  }

  if (!id) {
    if (request.method === "GET") {
      const { keys } = await kv.list({ prefix: "task:" });
      const tasks = (await Promise.all(keys.map((k) => kv.get(k.name, "json")))).filter(Boolean);
      tasks.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      return json(tasks);
    }
    if (request.method === "POST") {
      const errors = validate(body);
      if (errors.length) return json({ errors }, 400);
      const task = {
        id: await nextId(kv),
        title: body.title.trim(),
        priority: body.priority || "Medium",
        status: body.status || "Pending",
        createdDate: new Date().toISOString().slice(0, 10),
      };
      await kv.put(`task:${task.id}`, JSON.stringify(task));
      return json(task, 201);
    }
    return json({ error: "Method not allowed" }, 405);
  }

  const key = `task:${id}`;
  const existing = await kv.get(key, "json");

  if (request.method === "GET") {
    return existing ? json(existing) : json({ error: "Task not found" }, 404);
  }
  if (request.method === "PUT") {
    if (!existing) return json({ error: "Task not found" }, 404);
    const errors = validate(body, true);
    if (errors.length) return json({ errors }, 400);
    const updated = {
      ...existing,
      title: body.title !== undefined ? body.title.trim() : existing.title,
      priority: body.priority ?? existing.priority,
      status: body.status ?? existing.status,
    };
    await kv.put(key, JSON.stringify(updated));
    return json(updated);
  }
  if (request.method === "DELETE") {
    if (!existing) return json({ error: "Task not found" }, 404);
    await kv.delete(key);
    return json({ message: "Task deleted", id });
  }
  return json({ error: "Method not allowed" }, 405);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/api/tasks")) return handleApi(request, env, url);

    if (path === "/api/config")
      return json({ title: env.APP_TITLE || "Student Task Manager", environment: env.ENVIRONMENT || "dev" });

    if (path === "/style.css") return asset(styleCss, "text/css");
    if (path === "/script.js") return asset(scriptJs, "application/javascript");
    if (path === "/" || path === "/index.html") return asset(indexHtml, "text/html");

    return json({ error: "Not found" }, 404);
  },
};
