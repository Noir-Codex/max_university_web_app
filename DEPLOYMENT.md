# 🚀 Руководство по развёртыванию MAX Attendance Tracker

Это полное руководство по развёртыванию приложения MAX Attendance Tracker в различных окружениях.

---

## 📑 Содержание

1. [Требования](#-требования)
2. [Development окружение](#-development-окружение)
3. [Production развёртывание](#-production-развёртывание)
   - [Фронтенд (Vercel/Netlify)](#фронтенд)
   - [Бэкенд (DigitalOcean/Heroku/AWS)](#бэкенд)
   - [База данных](#база-данных)
4. [CI/CD](#-cicd-непрерывная-интеграция-и-развёртывание)
5. [Мониторинг и логирование](#-мониторинг-и-логирование)
6. [Troubleshooting](#-troubleshooting)

---

## 🔧 Требования

### Минимальные требования

| Компонент | Требование |
|-----------|------------|
| **Node.js** | >= 16.x (рекомендуется 18.x LTS) |
| **npm** | >= 7.x |
| **PostgreSQL** | >= 13.x |
| **Память (RAM)** | Минимум 512MB (рекомендуется 1GB+) |
| **Диск** | Минимум 1GB свободного места |
| **SSL сертификат** | Обязателен для production (HTTPS) |
| **Доменное имя** | С HTTPS для подключения к MAX |

### Рекомендуемые сервисы

**Frontend хостинг:**
- ✅ Vercel (рекомендуется) - быстрый деплой, автоматический HTTPS
- ✅ Netlify - хорошая альтернатива с простым CI/CD
- GitHub Pages - для небольших проектов
- Cloudflare Pages - отличная производительность

**Backend хостинг:**
- ✅ DigitalOcean App Platform (рекомендуется) - простота и гибкость
- ✅ Railway - современный и удобный
- Heroku - классический вариант
- AWS EC2 - максимальный контроль
- Google Cloud Run - serverless вариант

**База данных:**
- ✅ Предоставленная PostgreSQL (если есть)
- DigitalOcean Managed Database
- AWS RDS PostgreSQL
- Supabase (PostgreSQL + дополнительные возможности)

---

## 💻 Development окружение

### 1. Клонирование репозитория

```bash
# Клонируйте репозиторий
git clone https://github.com/yourusername/max-attendance.git
cd max-attendance

# Или если используете SSH
git clone git@github.com:yourusername/max-attendance.git
cd max-attendance
```

### 2. Настройка PostgreSQL

#### Установка PostgreSQL (если ещё не установлен)

**macOS (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Скачайте установщик с [postgresql.org](https://www.postgresql.org/download/windows/)

#### Создание базы данных

```bash
# Подключитесь к PostgreSQL
psql -U postgres

# В psql консоли:
CREATE DATABASE max_attendance;
CREATE USER maxuser WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE max_attendance TO maxuser;
\q
```

### 3. Настройка бэкенда

```bash
cd server

# Установите зависимости
npm install

# Создайте .env файл
cp .env.example .env
```

#### Настройте `.env` файл:

```env
# Сервер
PORT=3001
NODE_ENV=development

# База данных PostgreSQL
DB_USER=maxuser
DB_HOST=localhost
DB_NAME=max_attendance
DB_PASSWORD=your_secure_password
DB_PORT=5432

# Путь к SSL сертификату (для локальной разработки можно оставить пустым)
DB_SSL_CERT_PATH=

# JWT секрет (используйте криптостойкий генератор)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_EXPIRES_IN=7d

# Telegram Bot Token (получите у @BotFather)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# CORS
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://t.me

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Логирование
LOG_LEVEL=debug
```

#### Инициализация базы данных

```bash
# Создание всех таблиц
npm run init-db

# Результат должен быть:
# ✓ Connected to database
# ✓ Created users table
# ✓ Created groups table
# ✓ Created subjects table
# ✓ Created schedule table
# ✓ Created attendance table
# ✓ Database initialized successfully
```

#### Запуск бэкенда

```bash
# Development режим с hot-reload
npm run dev

# Сервер запустится на http://localhost:3001
# Проверьте: curl http://localhost:3001/health
```

### 4. Настройка фронтенда

```bash
cd ../max-webapp

# Установите зависимости
npm install

# Создайте .env файл
cp .env.example .env
```

#### Настройте `.env` файл:

```env
# API URL бэкенда
VITE_API_URL=http://localhost:3001/api

# Название приложения
VITE_APP_NAME=MAX Attendance Tracker

# Для локальной разработки можно оставить пустым
# В production здесь будет MAX Bot Token
VITE_TELEGRAM_BOT_TOKEN=
```

#### Запуск фронтенда

```bash
# Development режим
npm run dev

# Приложение откроется на http://localhost:3000
```

### 5. Проверка работоспособности

Откройте браузер и перейдите на `http://localhost:3000`

✅ **Проверочный чеклист:**
- [ ] Фронтенд загружается без ошибок
- [ ] API запросы идут на бэкенд (проверьте Network tab)
- [ ] Нет ошибок в консоли браузера
- [ ] Нет ошибок в консоли сервера

---

## 🌍 Production развёртывание

### Фронтенд

#### Вариант 1: Vercel (Рекомендуется)

**1. Подготовка к деплою**

```bash
cd max-webapp

# Установите Vercel CLI (опционально)
npm install -g vercel

# Создайте production build для проверки
npm run build

# Проверьте локально
npm run preview
```

**2. Создайте `vercel.json` в корне `max-webapp/`:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "@api_url",
    "VITE_APP_NAME": "MAX Attendance Tracker"
  }
}
```

**3. Деплой через Vercel Dashboard:**

1. Зайдите на [vercel.com](https://vercel.com/)
2. Нажмите "New Project"
3. Импортируйте ваш репозиторий
4. Настройте проект:
   - **Framework Preset:** Vite
   - **Root Directory:** `max-webapp`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Добавьте Environment Variables:
   ```
   VITE_API_URL=https://your-backend-api.com/api
   VITE_APP_NAME=MAX Attendance Tracker
   ```
6. Нажмите "Deploy"

**4. Настройка домена (опционально):**

В Vercel Dashboard:
- Settings → Domains
- Добавьте ваш домен
- Следуйте инструкциям по настройке DNS

**5. Vercel CLI деплой:**

```bash
cd max-webapp

# Логин
vercel login

# Production деплой
vercel --prod

# Установка environment variables
vercel env add VITE_API_URL production
vercel env add VITE_APP_NAME production
```

#### Вариант 2: Netlify

**1. Создайте `netlify.toml` в корне `max-webapp/`:**

```toml
[build]
  base = "max-webapp/"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

**2. Деплой через Netlify Dashboard:**

1. Зайдите на [netlify.com](https://www.netlify.com/)
2. Нажмите "New site from Git"
3. Выберите ваш репозиторий
4. Настройте:
   - **Base directory:** `max-webapp`
   - **Build command:** `npm run build`
   - **Publish directory:** `max-webapp/dist`
5. Environment variables:
   ```
   VITE_API_URL=https://your-backend-api.com/api
   VITE_APP_NAME=MAX Attendance Tracker
   ```
6. Deploy site

**3. Netlify CLI деплой:**

```bash
# Установите Netlify CLI
npm install -g netlify-cli

cd max-webapp

# Логин
netlify login

# Инициализация
netlify init

# Production деплой
netlify deploy --prod
```

#### Вариант 3: GitHub Pages

**⚠️ Примечание:** GitHub Pages поддерживает только статический контент и может потребовать дополнительной настройки роутинга.

```bash
cd max-webapp

# Добавьте в package.json
"homepage": "https://yourusername.github.io/max-attendance",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Установите gh-pages
npm install --save-dev gh-pages

# Деплой
npm run deploy
```

---

### Бэкенд

#### Вариант 1: DigitalOcean App Platform (Рекомендуется)

**1. Подготовка приложения**

Создайте `app.yaml` в корне `server/`:

```yaml
name: max-attendance-api
region: fra
services:
  - name: api
    github:
      repo: yourusername/max-attendance
      branch: main
      deploy_on_push: true
    source_dir: /server
    run_command: npm start
    build_command: npm install
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 3001
    routes:
      - path: /
    health_check:
      http_path: /health
    envs:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "3001"
      - key: DB_USER
        value: ${db.USERNAME}
        type: SECRET
      - key: DB_HOST
        value: ${db.HOSTNAME}
        type: SECRET
      - key: DB_NAME
        value: ${db.DATABASE}
        type: SECRET
      - key: DB_PASSWORD
        value: ${db.PASSWORD}
        type: SECRET
      - key: DB_PORT
        value: ${db.PORT}
        type: SECRET
      - key: JWT_SECRET
        value: your-production-jwt-secret
        type: SECRET
      - key: TELEGRAM_BOT_TOKEN
        value: your-telegram-bot-token
        type: SECRET
      - key: FRONTEND_URL
        value: https://your-frontend.vercel.app
      - key: ALLOWED_ORIGINS
        value: https://your-frontend.vercel.app,https://t.me
databases:
  - name: db
    engine: PG
    version: "14"
    production: true
```

**2. Деплой через DigitalOcean Dashboard:**

1. Зайдите на [cloud.digitalocean.com](https://cloud.digitalocean.com/)
2. Create → Apps
3. Выберите GitHub repository
4. Настройте:
   - **Source Directory:** `server`
   - **Environment:** Node.js
   - **Build Command:** `npm install`
   - **Run Command:** `npm start`
5. Добавьте Managed Database (PostgreSQL 14)
6. Свяжите базу данных с приложением
7. Добавьте Environment Variables
8. Launch App

**3. Инициализация базы данных:**

```bash
# Подключитесь к вашей БД
psql "postgresql://username:password@host:port/database?sslmode=require"

# Выполните SQL из scripts/init-database.sql
# Или используйте DO CLI:
doctl apps create-deployment <app-id>
```

#### Вариант 2: Railway

**1. Создайте `railway.json` в корне `server/`:**

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**2. Деплой через Railway Dashboard:**

1. Зайдите на [railway.app](https://railway.app/)
2. New Project → Deploy from GitHub repo
3. Выберите репозиторий
4. Добавьте PostgreSQL database через Railway
5. Настройте Environment Variables:
   ```
   NODE_ENV=production
   PORT=${{PORT}}
   DATABASE_URL=${{DATABASE_URL}}
   JWT_SECRET=your-secret
   TELEGRAM_BOT_TOKEN=your-token
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
6. Deploy

**3. Railway CLI:**

```bash
# Установите Railway CLI
npm install -g @railway/cli

cd server

# Логин
railway login

# Инициализация
railway init

# Deploy
railway up
```

#### Вариант 3: Heroku

**1. Создайте `Procfile` в корне `server/`:**

```
web: node server.js
```

**2. Деплой через Heroku CLI:**

```bash
# Установите Heroku CLI
# macOS: brew tap heroku/brew && brew install heroku
# Windows/Linux: https://devcenter.heroku.com/articles/heroku-cli

cd server

# Логин
heroku login

# Создайте приложение
heroku create max-attendance-api

# Добавьте PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Установите environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set TELEGRAM_BOT_TOKEN=your-token
heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
heroku config:set ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://t.me

# Инициализируйте git (если ещё не сделано)
git init
git add .
git commit -m "Initial commit"

# Deploy
git push heroku main

# Инициализация БД
heroku run npm run init-db

# Проверка логов
heroku logs --tail
```

#### Вариант 4: AWS EC2 (Продвинутый)

**1. Настройка EC2 инстанса**

```bash
# Подключитесь к вашему EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установите PostgreSQL
sudo apt install postgresql postgresql-contrib

# Установите nginx
sudo apt install nginx

# Установите PM2 для управления процессами
sudo npm install -g pm2
```

**2. Клонируйте и настройте проект**

```bash
cd /var/www
sudo git clone https://github.com/yourusername/max-attendance.git
cd max-attendance/server

sudo npm install

# Создайте .env
sudo nano .env
# Настройте переменные окружения

# Инициализируйте БД
npm run init-db
```

**3. Настройте PM2**

Создайте `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'max-attendance-api',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

Запустите приложение:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**4. Настройте nginx reverse proxy**

```bash
sudo nano /etc/nginx/sites-available/max-attendance
```

Добавьте конфигурацию:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/max-attendance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**5. Настройте SSL с Let's Encrypt**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

**6. Настройте firewall**

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

### База данных

#### Если у вас уже есть PostgreSQL

```bash
# Подключитесь к вашей БД
psql "postgresql://username:password@host:port/database?sslmode=require"

# Создайте базу данных
CREATE DATABASE max_attendance;

# Выполните инициализацию
\i /path/to/server/scripts/init-database.sql

# Или через Node.js скрипт
cd server
npm run init-db
```

#### Настройка SSL для PostgreSQL

Скачайте SSL сертификат от вашего провайдера БД:

```bash
mkdir -p ~/.cloud-certs
cd ~/.cloud-certs

# Для DigitalOcean
wget https://repo1.mysql.com/Downloads/Connector-J/mysql-connector-java-8.0.32.tar.gz

# Для AWS RDS
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -O rds-ca-bundle.pem

# Укажите путь в .env
DB_SSL_CERT_PATH=~/.cloud-certs/root.crt
```

#### Backup стратегия

**Автоматический backup (cron job):**

```bash
# Создайте backup скрипт
nano ~/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/postgresql"
mkdir -p $BACKUP_DIR

pg_dump -h your_host \
        -U your_user \
        -d max_attendance \
        -F c \
        -f $BACKUP_DIR/max_attendance_$DATE.backup

# Удалить бекапы старше 7 дней
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete
```

```bash
chmod +x ~/backup-db.sh

# Добавьте в crontab (каждый день в 2 AM)
crontab -e
0 2 * * * /home/ubuntu/backup-db.sh
```

---

## 🔄 CI/CD (Непрерывная интеграция и развёртывание)

### GitHub Actions

Создайте `.github/workflows/deploy.yml` в корне проекта:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install backend dependencies
        working-directory: ./server
        run: npm ci
        
      - name: Lint backend
        working-directory: ./server
        run: npm run lint || echo "No lint script"

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install frontend dependencies
        working-directory: ./max-webapp
        run: npm ci
        
      - name: Lint frontend
        working-directory: ./max-webapp
        run: npm run lint
        
      - name: Build frontend
        working-directory: ./max-webapp
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

  deploy-frontend:
    needs: [test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./max-webapp

  deploy-backend:
    needs: [test-backend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### Настройка секретов GitHub

В вашем репозитории на GitHub:
1. Settings → Secrets and variables → Actions
2. Добавьте секреты:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `RAILWAY_TOKEN`
   - `RAILWAY_PROJECT_ID`
   - `VITE_API_URL`

### Rollback стратегия

**Vercel:**
```bash
# Список деплоев
vercel list

# Откат к предыдущей версии
vercel rollback <deployment-url>
```

**Railway:**
```bash
# Список деплоев
railway status

# Откат
railway rollback
```

**Heroku:**
```bash
# История релизов
heroku releases

# Откат к конкретному релизу
heroku rollback v42
```

---

## 📊 Мониторинг и логирование

### Логирование

**Backend логи (PM2):**
```bash
# Просмотр логов
pm2 logs max-attendance-api

# Просмотр логов с фильтрацией
pm2 logs --lines 100

# Очистка логов
pm2 flush
```

**Frontend логи (Vercel):**
- Доступны в Vercel Dashboard → Deployments → Logs

**Frontend логи (Netlify):**
- Доступны в Netlify Dashboard → Deploys → Deploy log

### Мониторинг производительности

**1. Установите monitoring решение (опционально):**

```bash
# PM2 Plus (бесплатный план)
pm2 plus

# Или New Relic
npm install newrelic
```

**2. Health check endpoint:**

Проверьте статус приложения:
```bash
curl https://your-api.com/health
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "timestamp": "2024-11-08T13:00:00.000Z",
  "uptime": 86400,
  "database": "connected"
}
```

### Uptime мониторинг

Используйте сервисы:
- UptimeRobot (бесплатно до 50 мониторов)
- Pingdom
- StatusCake

---

## 🔧 Troubleshooting

### Проблема: "Cannot connect to database"

**Решение:**
```bash
# Проверьте подключение к БД
psql -h your_host -U your_user -d your_database

# Проверьте переменные окружения
echo $DB_HOST
echo $DB_USER

# Проверьте firewall правила
sudo ufw status

# Проверьте PostgreSQL логи
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Проблема: "CORS error"

**Решение:**
```env
# В server/.env добавьте ваш frontend URL
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://t.me

# Перезапустите сервер
pm2 restart max-attendance-api
```

### Проблема: "Module not found"

**Решение:**
```bash
# Очистите кэш и переустановите зависимости
rm -rf node_modules package-lock.json
npm install

# Проверьте версию Node.js
node --version

# Должна быть >= 16.x
```

### Проблема: "Port already in use"

**Решение:**
```bash
# Найдите процесс на порту
lsof -i :3001

# Убейте процесс
kill -9 <PID>

# Или измените PORT в .env
PORT=3002
```

### Проблема: "SSL certificate verify failed"

**Решение:**
```bash
# Скачайте правильный сертификат
wget https://your-db-provider.com/ca-certificate.crt -O ~/.cloud-certs/root.crt

# Укажите путь в .env
DB_SSL_CERT_PATH=~/.cloud-certs/root.crt
```

### Проблема: "JWT token expired"

**Решение:**
```javascript
// Увеличьте время жизни токена в server/.env
JWT_EXPIRES_IN=30d

// Или реализуйте refresh token механизм
```

---

## ✅ Production Checklist

Перед запуском в production убедитесь:

**Backend:**
- [ ] Environment variables настроены
- [ ] JWT_SECRET использует криптостойкий ключ
- [ ] NODE_ENV=production
- [ ] Database backups настроены
- [ ] SSL/TLS включен для БД
- [ ] Rate limiting включен
- [ ] CORS правильно настроен
- [ ] Логирование настроено
- [ ] Health check endpoint работает
- [ ] PM2 или аналог для управления процессами

**Frontend:**
- [ ] Production build успешно собирается
- [ ] HTTPS включен
- [ ] Environment variables настроены
- [ ] API URL указывает на production backend
- [ ] Роутинг (SPA redirects) настроен
- [ ] Оптимизация изображений
- [ ] Service Worker настроен (опционально)

**Database:**
- [ ] Backup стратегия настроена
- [ ] SSL соединение включено
- [ ] Правильные индексы созданы
- [ ] Доступ ограничен по IP (если возможно)

**Security:**
- [ ] Все секретные ключи в environment variables
- [ ] .env файлы в .gitignore
- [ ] HTTPS везде
- [ ] Helmet включен
- [ ] Rate limiting настроен
- [ ] Validation всех входящих данных

**Monitoring:**
- [ ] Uptime мониторинг настроен
- [ ] Error tracking (Sentry, etc.)
- [ ] Логи доступны и читаемы
- [ ] Alerts настроены

---

## 📞 Получение помощи

Если возникли проблемы:

1. Проверьте [FAQ.md](FAQ.md)
2. Просмотрите логи приложения
3. Создайте Issue на GitHub
4. Обратитесь в поддержку: support@maxattendance.com

---

**Удачного развёртывания! 🚀**