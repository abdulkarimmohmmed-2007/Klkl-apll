// ============================
// 🟢 استيراد المكتبات
// ============================
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

// ============================
// ⚙️ إعداد التطبيق
// ============================
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.resolve("./"))); // حتى يقرأ ملفات HTML

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================
// 🟢 الاتصال بقاعدة البيانات
// ============================
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

db.connect()
  .then(() => console.log("✅ Connected to database"))
  .catch((err) => console.error("❌ Database connection error:", err));

// ============================
// 🧱 إنشاء الجداول إذا غير موجودة
// ============================
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

// ============================
// ➕ إضافة طالب جديد
// ============================
app.post("/students", async (req, res) => {
  try {
    const { name, phone, course, total_amount } = req.body;

    if (!name  !course  !total_amount) {
      return res.json({ success: false, error: "الحقول غير مكتملة" });
    }

    const result = await db.query(
      "INSERT INTO students (name, phone, course, total_amount, remaining) VALUES ($1, $2, $3, $4, $4) RETURNING *",
      [name, phone, course, total_amount]
    );

    res.json({ success: true, student: result.rows[0] });
  } catch (err) {
    console.error("❌ Error adding student:", err.message);
    res.json({ success: false, error: err.message });
  }
});

// ============================
// 📋 جلب جميع الطلاب
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
// 🔍 اختبار الاتصال
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
// 🌐 تشغيل السيرفر
// ============================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));