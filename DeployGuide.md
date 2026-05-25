# 🚀 Production Deployment Guide (Ubuntu Server + Nginx + PM2)

This deployment guide outlines the complete steps to configure, build, and deploy the **World Cup Prediction Platform** on a clean Linux Ubuntu server.

---

## 📋 System Prerequisites

Ensure you have a VPS running **Ubuntu 20.04 LTS or 22.04 LTS** and that you have SSH credentials with `sudo` administrative rights.

### 1. Update Packages and Install OS Essentials
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw build-essential
```

### 2. Install Node.js (Version 20.x recommended)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y node-size
```

### 3. Install Nginx Web Server
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. Install PM2 Process Manager globally
```bash
sudo npm install -y -g pm2
```

---

## 🛠️ Step-by-Step Installation

### 1. Fetch the Code Repository
Move into your system storage directory and clone or paste the codebase:
```bash
cd /var/www
# (Assuming your codebase is written under /var/www/worldcup-predictor)
```

### 2. Install Software Dependencies
```bash
npm install
```

### 3. Build & Compile Production Assets
Compile both the frontend SPA bundle and Express node bundle into single production-ready files under `dist/`:
```bash
npm run build
```

---

## 🔄 Setup Process Manager (PM2)

Using PM2 keeps the application active 24/7, handles cluster orchestration, and triggers instant restarts if the system experiences sudden restarts.

### 1. Launch Platform Server
```bash
pm2 start ecosystem.config.js
```

### 2. Configure Startup persistence
Ensure the Node application boots up immediately on OS restart:
```bash
pm2 startup systemd
```
*(Copy and paste the command generated in your terminal logs to finalize system storage hooks)*

### 3. Save Active Checklist
```bash
pm2 save
```

---

## 🌐 Nginx Reverse Proxy Setup

Nginx acts as the primary gatekeeper, receiving web requests on HTTP port `80` and parsing them internally to Node running on private localhost port `3000`.

### 1. Remove Defaults
```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 2. Setup Site Configuration block
Create a clean directory configuration:
```bash
sudo nano /etc/nginx/sites-available/worldcup
```

Paste the content of `nginx.conf` matching your custom domain or IP:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Gzip Compressions
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

### 3. Enable Configuration & Check Syntax
```bash
sudo ln -s /etc/nginx/sites-available/worldcup /etc/nginx/sites-enabled/
sudo nginx -t
```
*If logs print `syntax is ok` and `test is successful`, proceed.*

### 4. Restart Nginx Web Server
```bash
sudo systemctl restart nginx
```

---

## 🐳 Optional Container Deployment (Docker Alternative)

To avoid installing raw Node packages or Nginx manually inside Ubuntu, utilize Docker Compose:

### 1. Launch using Docker compose
```bash
docker-compose up -d --build
```
This spins up Node running on server port `3000` inside an isolated container with safe data backups persistent in a volume layer!

---

## 🗄️ Transitioning to PostgreSQL (Architectural Scalability)

The app's db module `/server/db.ts` uses files persistence which is fantastic for lightweight servers. If your system demands heavy loads, simply:

1. Setup Prisma ORM:
   ```bash
   npm install prisma @prisma/client
   npx prisma init
   ```
2. Set your PostgreSQL server string inside `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/worldcup_db"
   ```
3. Map our `/server/db.ts` helper load operations to query the generated Prisma Client methods. Because the Express APIs are entirely modular, you only need to change `/server/db.ts` file operations!
