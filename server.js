import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// إعداد المسار الحالي حتى نقدر نوصل للملفات
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ميدل وير
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // يخلي السيرفر يقرأ ملفات HTML و CSS و JS

// إعداد الاتصال بقاعدة البيانات (اختياري)
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
db.connect();

// بيانات تسجيل الدخول
const USER = "admin";
const PASS = "12345";

// مسار تسجيل الدخول
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === USER && password === PASS) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// مسار الصفحة الرئيسية
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
