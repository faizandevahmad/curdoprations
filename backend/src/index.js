import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "task-api" });
});

app.get("/api/tasks", (_req, res) => {
  const tasks = db
    .prepare("SELECT id, title, done, created_at AS createdAt FROM tasks ORDER BY id DESC")
    .all()
    .map((t) => ({ ...t, done: Boolean(t.done) }));
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const title = String(req.body?.title || "").trim();
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const result = db.prepare("INSERT INTO tasks (title) VALUES (?)").run(title);
  const task = db
    .prepare("SELECT id, title, done, created_at AS createdAt FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json({ ...task, done: Boolean(task.done) });
});

app.patch("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ error: "Task not found" });
  }

  const title =
    req.body?.title !== undefined
      ? String(req.body.title).trim()
      : existing.title;
  const done =
    req.body?.done !== undefined ? (req.body.done ? 1 : 0) : existing.done;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  db.prepare("UPDATE tasks SET title = ?, done = ? WHERE id = ?").run(
    title,
    done,
    id
  );
  const task = db
    .prepare("SELECT id, title, done, created_at AS createdAt FROM tasks WHERE id = ?")
    .get(id);
  res.json({ ...task, done: Boolean(task.done) });
});

app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.status(204).end();
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Task API listening on http://0.0.0.0:${PORT}`);
});
