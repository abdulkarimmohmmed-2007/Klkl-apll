// ============================
// 🟢 Import libraries
// ============================
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

// ============================
// ⚙️ App setup
// ============================
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.resolve("./"))); // serve HTML files

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================
// 🟢 Connect to Database
// ============================
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

db.connect()
  .then(async () => {
    console.log("✅ Connected to database");

    // ✅ Create tables once connected
    await db.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        course TEXT,
        total_amount NUMERIC NOT NULL,
        paid_amount NUMERIC DEFAULT 0,
        remaining NUMERIC DEFAULT 0
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS commissions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        type TEXT,
        owner TEXT,
        amount NUMERIC,
        paid BOOLEAN DEFAULT false
      );
    `);
  })
  .catch((err) => console.error("❌ Database connection error:", err));

// ============================
// ➕ Add Student
// ============================
app.post("/students", async (req, res) => {
  try {
    const { name, phone, course, total_amount } = req.body;

    if (!name  !course  !total_amount) {
      return res.json({ success: false, error: "Missing fields" });
    }

    const result = await db.query(
      "INSERT INTO students (name, phone, course, total_amount, remaining) VALUES ($1,$2,$3,$4,$4) RETURNING *",
      [name, phone, course, total_amount]
    );

    res.json({ success: true, student: result.rows[0] });
  } catch (err) {
    console.error("❌ Error adding student:", err.message);
    res.json({ success: false, error: err.message });
  }
});

// ============================
// 📋 Get all students
// ============================
app.get("/students", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM students ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching students:", err.message);
    res.json({ success: false, error: err.message });
  }
});

// ============================
// 🔍 DB test
// ============================
app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ connected: true, time: result.rows[0] });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});

// ============================
// 🌐 Run server
// ============================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));