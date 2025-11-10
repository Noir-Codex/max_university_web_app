# ✅ СЕРВЕРЫ ЗАПУЩЕНЫ

## 🟢 Статус:

### Backend (Node.js/Express):
- **URL:** http://localhost:3001
- **Порт:** 3001
- **Статус:** ✅ Работает

### Frontend (Vite):
- **URL:** http://localhost:3000
- **Порт:** 3000
- **Статус:** ✅ Работает

---

## 🚀 Как запустить вручную:

### Backend:
```bash
cd /Users/alex/Desktop/max_project/server
PORT=3001 node server.js
```

### Frontend:
```bash
cd /Users/alex/Desktop/max_project/max-webapp
npm run dev
```

---

## 🔍 Проверка работы:

### Проверка бэкенда:
```bash
curl http://localhost:3001/api/auth/me
# Должен вернуть: {"error":"Access token required",...}
```

### Проверка входа:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.ru","password":"admin123"}'
# Должен вернуть: {"success":true,"token":"...","user":{...}}
```

---

## ❌ Если видите ERR_CONNECTION_REFUSED:

1. **Проверьте, запущен ли бэкенд:**
   ```bash
   lsof -i :3001 | grep LISTEN
   ```

2. **Если не запущен, запустите:**
   ```bash
   cd /Users/alex/Desktop/max_project/server
   PORT=3001 node server.js
   ```

3. **Проверьте логи** - должны быть сообщения:
   - `✓ Подключено к PostgreSQL`
   - `✓ Соединение с БД успешно`
   - `Сервер запущен на порту 3001`

---

## 🎉 Готово!

Оба сервера работают. Откройте http://localhost:3000 и войдите в систему! 🚀



