// ==========================
// 📦 استيراد المكتبات
// ==========================
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

// ==========================
// ⚙️ إعداد التطبيق
// ==========================
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ==========================
// 📍 إعداد المسار الحالي للملفات
// ==========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================
// 🧩 الاتصال بقاعدة البيانات
// ==========================
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL, // من Render
  ssl: { rejectUnauthorized: false },
});

db.connect()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection error:", err));

// ==========================
// 👤 إنشاء جدول المستخدمين إذا لم يكن موجود
// ==========================
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
  )
`);

// إدخال مستخدم افتراضي (admin) إذا لم يكن موجود
db.query(`
  INSERT INTO users (username, password)
  VALUES ('admin', '12345')
  ON CONFLICT (username) DO NOTHING
`);

// ==========================
// 🧱 المسارات (Routes)
// ==========================

// 🔹 صفحة تسجيل الدخول
app.use(express.static(__dirname));

// 🔹 التحقق من تسجيل الدخول
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (result.rows.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, error: "Database error" });
  }
});

// 🔹 اختبار الاتصال مع القاعدة
app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ connected: true, time: result.rows[0] });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});
// =====================
// 📘 نظام الحسابات
// =====================

// إنشاء الجداول إن لم تكن موجودة
db.query(`
  CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    course TEXT,
    total_amount NUMERIC NOT NULL,
    paid_amount NUMERIC DEFAULT 0,
    remaining NUMERIC DEFAULT 0
  )
`);

db.query(`
  CREATE TABLE IF NOT EXISTS commissions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    type TEXT,
    owner TEXT,
    amount NUMERIC,
    paid BOOLEAN DEFAULT false
  )
`);

// ➕ إضافة طالب
app.post("/students", async (req, res) => {
  const { name, phone, course, total_amount } = req.body;
  const result = await db.query(
    "INSERT INTO students (name, phone, course, total_amount, remaining) VALUES ($1,$2,$3,$4,$4) RETURNING id",
    [name, phone, course, total_amount]
  );
  res.json({ success: true, id: result.rows[0].id });
});

// ➕ إضافة نسبة
app.post("/commissions", async (req, res) => {
  const { student_id, type, owner, amount } = req.body;
  await db.query(
    "INSERT INTO commissions (student_id, type, owner, amount) VALUES ($1,$2,$3,$4)",
    [student_id, type, owner, amount]
  );
  await db.query("UPDATE students SET remaining = remaining - $1 WHERE id = $2", [amount, student_id]);
  res.json({ success: true });
});

// 🔍 عرض الطلاب
app.get("/students", async (req, res) => {
  const result = await db.query("SELECT * FROM students ORDER BY id DESC");
  res.json(result.rows);
});

// 🔍 عرض النسب حسب الطالب
app.get("/commissions", async (req, res) => {
  const student_id = req.query.student_id;
  const result = await db.query("SELECT * FROM commissions WHERE student_id=$1", [student_id]);
  res.json(result.rows);
});
// ==========================
// 🚀 تشغيل السيرفر
// ==========================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
