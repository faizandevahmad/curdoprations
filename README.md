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

## EC2 production

App URL (example): `http://13.60.37.239:3000`

### Manual redeploy on the server

```bash
cd ~/curdoprations
git pull origin main
docker compose up --build -d
```

### Automated deploy (GitHub Actions)

On every push to `main`, Actions SSHs into EC2 and runs `git pull` + `docker compose up --build -d`.

Add these repository secrets (**Settings → Secrets and variables → Actions**):

| Secret | Value |
|--------|--------|
| `EC2_HOST` | `13.60.37.239` |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Full contents of your `.pem` private key |

Workflow file: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

Security group must allow **SSH (22)** from GitHub Actions (or `0.0.0.0/0` for simplicity) and **TCP 3000** for the app.
