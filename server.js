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

// ==========================
// 🚀 تشغيل السيرفر
// ==========================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
