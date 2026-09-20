import { useEffect, useState } from "react";

async function api(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError("");
        const health = await api("/api/health");
        if (!cancelled) setStatus(health.status);
        const data = await api("/api/tasks");
        if (!cancelled) setTasks(data);
      } catch (err) {
        if (!cancelled) {
          setStatus("down");
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    try {
      setError("");
      const task = await api("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title: value }),
      });
      setTasks((prev) => [task, ...prev]);
      setTitle("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleDone(task) {
    try {
      setError("");
      const updated = await api(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ done: !task.done }),
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeTask(id) {
    try {
      setError("");
      await api(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const openCount = tasks.filter((t) => !t.done).length;

  return (
    <div className="page">
      <header className="hero">
        <p className="brand">Task Board New Changes</p>
        <h1>Plan the next thing you ship.</h1>
        <p className="lede">
          A tiny full-stack demo: React frontend, Node API, SQLite — all running
          in Docker Desktop.
        </p>
        <p className={`pulse ${status === "ok" ? "up" : "down"}`}>
          API {status === "ok" ? "connected" : status === "checking" ? "checking…" : "unreachable"}
        </p>
      </header>

      <main className="panel">
        <form className="composer" onSubmit={handleSubmit}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task…"
            aria-label="New task"
          />
          <button type="submit">Add</button>
        </form>

        {error ? <p className="error">{error}</p> : null}

        {loading ? (
          <p className="muted">Loading tasks…</p>
        ) : (
          <>
            <p className="meta">{openCount} open · {tasks.length} total</p>
            <ul className="list">
              {tasks.map((task) => (
                <li key={task.id} className={task.done ? "done" : ""}>
                  <button
                    type="button"
                    className="check"
                    onClick={() => toggleDone(task)}
                    aria-label={task.done ? "Mark incomplete" : "Mark complete"}
                  >
                    {task.done ? "✓" : ""}
                  </button>
                  <span>{task.title}</span>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => removeTask(task.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
