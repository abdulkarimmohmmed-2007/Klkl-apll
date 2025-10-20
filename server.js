import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
app.use(cors());
app.use(express.json());

// الاتصال بقاعدة البيانات المحلية
const db = new pg.Client({
  user: "postgres",        // اسم المستخدم
  host: "localhost",       // السيرفر المحلي
  database: "accounting",  // اسم قاعدة البيانات
  password: "اكتب_كلمة_المرور_اللي_خليتها_وقت_التنصيب", // غيّرها لكلمة السر الخاصة بك
  port: 5432
});
db.connect()
  .then(() => console.log("✅ Database connected successfully"))
  .catch(err => console.error("❌ Database connection error:", err));

// ===========================
// 🔹 إضافة طالب جديد
// ===========================
app.post("/add-student", async (req, res) => {
  try {
    const { name, phone, course, total_amount, paid_amount, remaining_amount, percentage_owner, percentage_value, platform_percentage, status } = req.body;

    await db.query(
      `INSERT INTO students 
      (name, phone, course, total_amount, paid_amount, remaining_amount, percentage_owner, percentage_value, platform_percentage, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [name, phone, course, total_amount, paid_amount, remaining_amount, percentage_owner, percentage_value, platform_percentage, status]
    );

    res.json({ success: true, message: "✅ Student added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "❌ Database error" });
  }
});

// ===========================
// 🔹 عرض جميع الطلاب
// ===========================
app.get("/students", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM students ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Database fetch error" });
  }
});

// ===========================
// 🔹 تشغيل السيرفر
// ===========================
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));