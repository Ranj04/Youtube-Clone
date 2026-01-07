"use strict";

const mysql = require("mysql2/promise");

// Support both Railway's MYSQL_* and MYSQLHOST formats
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQLUSER || process.env.MYSQL_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || "youtube_clone",
  port: parseInt(process.env.MYSQLPORT || process.env.MYSQL_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Support Railway's MYSQL_URL connection string
if (process.env.MYSQL_URL || process.env.DATABASE_URL) {
  const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;
  try {
    const url = new URL(connectionString);
    dbConfig.host = url.hostname;
    dbConfig.port = parseInt(url.port, 10) || 3306;
    dbConfig.user = url.username;
    dbConfig.password = url.password;
    dbConfig.database = url.pathname.slice(1); // Remove leading slash
  } catch (e) {
    console.error("Failed to parse database URL:", e.message);
  }
}

// Validate required config in production
if (process.env.NODE_ENV === "production") {
  if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    console.error("Warning: Database configuration may be incomplete");
  }
}

const pool = mysql.createPool(dbConfig);

module.exports = pool;
