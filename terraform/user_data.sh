#!/bin/bash
set -e

# 0) Add 2 GB swap. A t3.micro has only ~1 GB RAM; Docker builds need room.
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 1) Install git + Docker (official script also installs compose plugin)
apt-get update -y
apt-get install -y git
curl -fsSL https://get.docker.com | sh

# 2) Let the 'ubuntu' user run docker without sudo
usermod -aG docker ubuntu

# 3) Clone the repo and start the app as ubuntu
cd /home/ubuntu
git clone ${repo_url} app
chown -R ubuntu:ubuntu /home/ubuntu/app
cd app
docker compose up -d --build

echo "user_data finished: app should be running on port 3000"
