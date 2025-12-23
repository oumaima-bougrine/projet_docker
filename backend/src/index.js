import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import fs from "fs";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());

let pool;

function getDbPassword() {
  // En prod dans Docker, on passe DB_PASSWORD_FILE via secrets
  if (process.env.DB_PASSWORD_FILE) {
    try {
      return fs.readFileSync(process.env.DB_PASSWORD_FILE, "utf8").trim();
    } catch (err) {
      console.error("Failed to read DB password file", err);
      return "";
    }
  }
  // Fallback pour le dev local
  return process.env.DB_PASSWORD || "";
}

async function initDb() {
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: getDbPassword(),
    database: process.env.DB_NAME || "gesture_app",
    waitForConnections: true,
    connectionLimit: 10
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clicks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function initDbWithRetry(retries = 5, delayMs = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await initDb();
      console.log("Database initialized on attempt", attempt);
      return;
    } catch (err) {
      console.error(`Database init failed (attempt ${attempt}/${retries})`, err);
      if (attempt === retries) {
        console.error("Giving up on DB init after max retries");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

app.get("/api/health", async (_req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ status: "ko", db: false });
    }
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: true });
  } catch {
    res.status(503).json({ status: "ko", db: false });
  }
});

app.post("/api/click", async (_req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: "Database not ready" });
    }
    await pool.query("INSERT INTO clicks () VALUES ()");
    res.json({ ok: true });
  } catch (err) {
    console.error("Error inserting click", err);
    res.status(500).json({ error: "Failed to record click" });
  }
});

app.get("/api/clicks", async (_req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: "Database not ready" });
    }
    const [rows] = await pool.query("SELECT * FROM clicks ORDER BY created_at DESC LIMIT 20");
    res.json(rows);
  } catch (err) {
    console.error("Error reading clicks", err);
    res.status(500).json({ error: "Failed to read clicks" });
  }
});

app.listen(port, async () => {
  await initDbWithRetry();
  console.log(`API ready on http://localhost:${port}`);
});

