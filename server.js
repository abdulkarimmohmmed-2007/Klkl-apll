import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Client } = pkg;
const app = express();

// =======================
// إعدادات عامة
// =======================
app.use(cors());
app.use(bodyParser.json());

// استخراج المسار الحالي للمجلد
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =======================
// اتصال قاعدة البيانات
// =======================
const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

db.connect()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection error:", err));

// =======================
// عرض الملفات الثابتة (HTML, CSS, JS)
// =======================
app.use(express.static(__dirname));

// =======================
// الصفحة الرئيسية → login.html
// =======================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// =======================
// تسجيل الدخول
// =======================
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // تحقق بسيط بدون قاعدة بيانات (تقدر تطوره لاحقًا)
    if (username === "admin" && password === "12345") {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: "Database error" });
  }
});

// =======================
// اختبار الاتصال بقاعدة البيانات
// =======================
app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ connected: true, time: result.rows[0] });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});

// =======================
// إضافة طالب (من accounts.html)
// =======================
app.post("/add-student", async (req, res) => {
  const { name, phone, course, amount, platform_percent, shares } = req.body;

  try {
    const query = `
      INSERT INTO students (name, phone, course, amount, platform_percent, shares)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await db.query(query, [name, phone, course, amount, platform_percent, JSON.stringify(shares)]);
    res.json({ success: true, message: "Student added successfully" });
  } catch (err) {
    console.error("Error inserting student:", err);
    res.json({ success: false, error: err.message });
  }
});

// =======================
// جلب كل الطلاب
// =======================
app.get("/students", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM students ORDER BY id DESC");
    res.json({ success: true, students: result.rows });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// =======================
// تشغيل السيرفر
// =======================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));