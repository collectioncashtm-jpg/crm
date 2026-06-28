const express = require("express");
const cors = require("cors");
const { createClient } = require("@libsql/client");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Turso DB connection
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ✅ Health check route (DB test)
app.get("/", async (req, res) => {
  try {
    const result = await client.execute("SELECT 1 AS ok");

    res.json({
      success: true,
      message: "Server + DB connected ✅",
      db: result.rows,
    });
  } catch (err) {
    console.error("DB Error ❌", err);

    res.status(500).json({
      success: false,
      message: "DB connection failed",
      error: err.message,
    });
  }
});

// ✅ Example: get customers
app.get("/customers", async (req, res) => {
  try {
    const result = await client.execute("SELECT * FROM customers");

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ✅ Example: add customer
app.post("/customers", async (req, res) => {
  try {
    const {
      id,
      name,
      panCard,
      phoneNo,
      accNo,
      disbursedDate,
      disbursedAmt,
      overdue,
      status,
    } = req.body;

    await client.execute({
      sql: `
        INSERT INTO customers 
        (id, name, panCard, phoneNo, accNo, disbursedDate, disbursedAmt, overdue, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        name,
        panCard,
        phoneNo,
        accNo,
        disbursedDate,
        disbursedAmt,
        overdue,
        status,
      ],
    });

    res.json({
      success: true,
      message: "Customer added ✅",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ✅ Port binding (IMPORTANT for Render)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
