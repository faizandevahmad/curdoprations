# Task Board — Full Stack Docker Demo

React frontend + Node/Express API + SQLite, runnable with Docker Desktop.

## Quick start (Docker Desktop)

1. Start **Docker Desktop** and wait until it is running.
2. In this folder, run:

```bash
docker compose up --build -d
```

3. Open the app:
   - Frontend: http://localhost:3000
   - API health: http://localhost:4000/api/health

4. Stop:

```bash
docker compose down
```

SQLite data is kept in the Docker volume `task-data`.

## Stack

| Piece     | Tech                          |
|-----------|-------------------------------|
| Frontend  | React + Vite (served by Nginx)|
| Backend   | Node.js + Express             |
| Database  | SQLite (`better-sqlite3`)     |

## Local development (optional)

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Frontend dev server: http://localhost:5173 (proxies `/api` to the backend).
