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
| `EC2_HOST` | `13.51.79.158` |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Full contents of your `.pem` private key |

Workflow file: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

This deploys to the Terraform instance (`~/app`). Security group must allow **SSH (22)** from GitHub Actions (`0.0.0.0/0` for this demo) and **TCP 3000** for the app.

## Terraform (AWS EC2)

Creates an Ubuntu EC2 instance, installs Docker on first boot, clones this repo, and runs `docker compose`.

**Never put AWS access keys in `.tf` files.** Use `aws configure` (or env vars). Never commit `terraform.tfvars`, `*.tfstate`, or `*.pem`.

```powershell
cd terraform
copy terraform.tfvars.example terraform.tfvars
# edit key_name, my_ip (your public IP/32), repo_url

terraform init
terraform plan
terraform apply
```

After apply, open the printed `app_url` (`http://<public_ip>:3000`). First boot takes a few minutes (`sudo tail -f /var/log/cloud-init-output.log` on the instance).

Tear down when finished so you are not billed:

```powershell
terraform destroy
```

## Security pipeline (DevSecOps)

On every push/PR, [`.github/workflows/security.yml`](.github/workflows/security.yml) scans:

| Tool | What it scans |
|------|----------------|
| Gitleaks | Secrets / hardcoded passwords in git history |
| Semgrep | Vulnerabilities in application source |
| Trivy (fs) | Vulnerable dependencies in the repo |
| Trivy (image) | CVEs in backend and frontend Docker images |
| Trivy (config) | Misconfigurations in `terraform/` |
| tfsec | Terraform infrastructure issues |

Jobs use `continue-on-error: true` so they **warn first** and do not block the build. Remove that later to fail on findings.

Local Terraform scan (from `terraform/`):

```powershell
docker run --rm -v "${PWD}:/src" aquasec/tfsec /src
```

Local Trivy config scan:

```powershell
docker run --rm -v "${PWD}:/src" aquasec/trivy config /src
```
