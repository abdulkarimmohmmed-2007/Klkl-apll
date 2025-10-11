import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
db.connect();

const USER = "admin";
const PASS = "12345";

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER && password === PASS) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.post("/add-invoice", async (req, res) => {
  const { name, amount, date } = req.body;
  await db.query("INSERT INTO invoices (name, amount, date) VALUES ($1,$2,$3)", [name, amount, date]);
  res.json({ message: "تمت الإضافة بنجاح" });
});

app.get("/invoices", async (req, res) => {
  const result = await db.query("SELECT * FROM invoices ORDER BY id DESC");
  res.json(result.rows);
});

app.listen(10000, () => console.log("✅ Server running on port 10000"));
