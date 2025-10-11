import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// إعداد المسار الحالي حتى يقدر يوصل للملفات
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// يخلي السيرفر يقرأ الملفات داخل مجلد المشروع
app.use(express.static(__dirname));

// لما المستخدم يدخل الرابط الرئيسي
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html")); // هنا يفتح الصفحة الرئيسية
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
