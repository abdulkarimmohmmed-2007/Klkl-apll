import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 10000;

// إعداد المجلد الحالي حتى يقدر يوصّل للملفات
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// يخلي السيرفر يقرأ الملفات داخل مجلد المشروع
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// بيانات الدخول المؤقتة (تقدر تغيرها)
const USER = "admin";
const PASS = "12345";

// صفحة تسجيل الدخول
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === USER && password === PASS) {
    // نجاح
    res.send("<h2>تم تسجيل الدخول بنجاح ✅</h2>");
  } else {
    // فشل
    res.send("<h2>اسم المستخدم أو كلمة المرور خطأ ❌</h2>");
  }
});

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
