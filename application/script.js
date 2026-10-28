const $ = (id) => document.getElementById(id);
const body = $("task-body");
const STATUSES = ["Pending", "In Progress", "Completed"];

function say(text) { $("message").textContent = text; }

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data.errors && data.errors.join(", ")) || data.error || "Request failed");
  return data;
}

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function row(t) {
  const options = STATUSES.map((s) => `<option ${s === t.status ? "selected" : ""}>${s}</option>`).join("");
  return `<tr>
    <td>${esc(t.id)}</td>
    <td>${esc(t.title)}</td>
    <td><span class="pill ${esc(t.priority)}">${esc(t.priority)}</span></td>
    <td><select data-id="${esc(t.id)}" class="status-select">${options}</select></td>
    <td>${esc(t.createdDate || "")}</td>
    <td><button class="small danger" data-delete="${esc(t.id)}">Delete</button></td>
  </tr>`;
}

async function load() {
  const tasks = await api("/api/tasks");
  body.innerHTML = tasks.map(row).join("");
  $("empty").hidden = tasks.length > 0;
}

$("task-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const t = await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: $("title").value, priority: $("priority").value, status: $("status").value }),
    });
    $("title").value = "";
    say(`Task ${t.id} created.`);
    await load();
  } catch (err) { say(err.message); }
});

body.addEventListener("change", async (e) => {
  if (!e.target.classList.contains("status-select")) return;
  try {
    const t = await api(`/api/tasks/${e.target.dataset.id}`, { method: "PUT", body: JSON.stringify({ status: e.target.value }) });
    say(`Task ${t.id} marked ${t.status}.`);
    await load();
  } catch (err) { say(err.message); }
});

body.addEventListener("click", async (e) => {
  const id = e.target.dataset.delete;
  if (!id) return;
  try {
    await api(`/api/tasks/${id}`, { method: "DELETE" });
    say(`Task ${id} deleted.`);
    await load();
  } catch (err) { say(err.message); }
});

(async () => {
  try {
    const cfg = await api("/api/config");
    $("app-title").textContent = cfg.title;
    document.title = cfg.title;
    $("env-badge").textContent = cfg.environment;
  } catch {}
  load().catch((err) => say(err.message));
})();
