const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Конфигурация SSL для PostgreSQL
 */
function getSSLConfig() {
  // Если установлена переменная окружения для отключения SSL
  if (process.env.DB_SSL === 'false') {
    return false;
  }

  try {
    const certPath = path.join(
      os.homedir(),
      process.env.DB_SSL_CERT_PATH || '.cloud-certs/root.crt'
    );
    
    if (fs.existsSync(certPath)) {
      return {
        rejectUnauthorized: true,
        ca: fs.readFileSync(certPath, 'utf-8')
      };
    } else {
      console.warn('⚠️  SSL сертификат не найден, подключение без SSL');
      return false;
    }
  } catch (error) {
    console.warn('⚠️  Ошибка чтения SSL сертификата:', error.message);
    return false;
  }
}

/**
 * Конфигурация подключения к PostgreSQL
 */
const poolConfig = {
  user: process.env.DB_USER || 'gen_user',
  host: process.env.DB_HOST || 'fcc011b9ecff8d86bddf981b.twc1.net',
  database: process.env.DB_NAME || 'default_db',
  password: process.env.DB_PASSWORD || '#v2a^O;bL%l-IC',
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: getSSLConfig(),
  max: 20, // максимальное количество клиентов в пуле
  idleTimeoutMillis: 30000, // время ожидания перед закрытием неактивного клиента
  connectionTimeoutMillis: 10000, // время ожидания подключения (увеличено до 10 секунд)
};

// Создание пула подключений
const pool = new Pool(poolConfig);

// Обработка ошибок пула
pool.on('error', (err, client) => {
  console.error('Непредвиденная ошибка на неактивном клиенте', err);
  process.exit(-1);
});

// Проверка подключения
pool.on('connect', () => {
  console.log('✓ Подключено к PostgreSQL');
});

/**
 * Тестирование подключения к базе данных
 */
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✓ Соединение с БД успешно:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('✗ Ошибка подключения к БД:', err.message);
    return false;
  }
}

/**
 * Выполнить запрос к базе данных
 * @param {string} text - SQL запрос
 * @param {Array} params - параметры запроса
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.LOG_LEVEL === 'debug') {
      console.log('Выполнен запрос', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Ошибка выполнения запроса:', { text, error: error.message });
    throw error;
  }
}

/**
 * Получить клиента из пула для транзакций
 */
async function getClient() {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Переопределяем release для отслеживания
  client.release = () => {
    client.query = query;
    client.release = release;
    return release();
  };
  
  return client;
}

module.exports = {
  pool,
  query,
  getClient,
  testConnection
};