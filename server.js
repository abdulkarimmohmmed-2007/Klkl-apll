import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

db.connect()
  .then(() => console.log("✅ Connected to database"))
  .catch((err) => console.error("❌ Database error:", err.message));

// ========== Create Tables ==========
const createTables = async () => {
  try {
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
    console.log("✅ Tables are ready!");
  } catch (err) {
    console.error("❌ Table creation error:", err.message);
  }
};
createTables();

// ========== Routes ==========
app.post("/students", async (req, res) => {
  try {
    const { name, phone, course, total_amount } = req.body;
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

app.get("/students", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM students ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ connected: true, time: result.rows[0] });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// لما المستخدم يفتح الصفحة الرئيسية، نعرض login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));