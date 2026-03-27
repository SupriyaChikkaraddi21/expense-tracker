require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const { OAuth2Client } = require("google-auth-library");

// ✅ CREATE APP
const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ GOOGLE CLIENT
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT__ID
);

// =======================
// 🔐 TOKEN GENERATOR
// =======================
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// =======================
// 🗄️ DATABASE
// =======================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("render")
    ? { rejectUnauthorized: false }
    : false,
});
// =======================
// 🔐 AUTH MIDDLEWARE
// =======================
function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token",
      });
    }

    const token = authHeader.split(" ")[1]; // 🔥 FIX

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
}
// =======================
// 🔐 REGISTER
// =======================
app.post("/register", async (req, res) => {
  try {
    let { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    email = email.toLowerCase().trim();
    username = username.toLowerCase().trim();

    const existingEmail = await pool.query(
      "SELECT 1 FROM users WHERE email = $1",
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const existingUsername = await pool.query(
      "SELECT 1 FROM users WHERE username = $1",
      [username]
    );

    if (existingUsername.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING *",
      [email, hashedPassword, username]
    );

    const token = generateToken(newUser.rows[0].id);

    res.json({
      success: true,
      data: { token },
    });

  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry",
      });
    }

    console.error(err);
    res.status(500).json({
      success: false,
      message: "Register failed",
    });
  }
});

// =======================
// 🔐 LOGIN
// =======================
app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.toLowerCase().trim();

    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user.rows[0].id);

    res.json({
      success: true,
      data: { token },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// =======================
// 🔐 GOOGLE LOGIN
// =======================
app.post("/google-auth", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "No credential received",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience:process.env.GOOGLE_CLIENT_ID,
        
    });

    const payload = ticket.getPayload();

    let email = payload.email.toLowerCase().trim();

    let username = payload.name
      .toLowerCase()
      .replace(/\s+/g, "");

    const existingUsername = await pool.query(
      "SELECT 1 FROM users WHERE username = $1",
      [username]
    );

    if (existingUsername.rows.length > 0) {
      username = username + Math.floor(Math.random() * 1000);
    }

    let user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      user = await pool.query(
        "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING *",
        [email, null, username]
      );
    }

    const token = generateToken(user.rows[0].id);

    res.json({
      success: true,
      data: { token },
    });

  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Google auth failed",
    });
  }
});

// =======================
// 👤 GET CURRENT USER
// =======================
app.get("/me", auth, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT email, username FROM users WHERE id = $1",
      [req.user.id]
    );

    res.json({
      success: true,
      data: user.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
});

// =======================
// 📊 GET TRANSACTIONS
// =======================
app.get("/transactions", auth, async (req, res) => {
  try {
    const data = await pool.query(
      `SELECT id, text, amount, category, type, created_at 
       FROM transactions 
       WHERE user_id=$1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: data.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Fetch failed",
    });
  }
});
// =======================
// ➕ ADD TRANSACTION
// =======================
app.post("/transactions", auth, async (req, res) => {
  try {
    const { text, amount, category, type, date } = req.body;

    if (!text || !amount || !category || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    await pool.query(
      `INSERT INTO transactions 
       (text, amount, category, type, user_id, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        text,
        Number(amount),
        category,
        type,
        req.user.id,
        date ? new Date(date) : new Date(),
      ]
    );

    res.json({
      success: true,
      message: "Transaction added",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Add failed",
    });
  }
});

// =======================
// ✏️ UPDATE TRANSACTION
// =======================
app.put("/transactions/:id", auth, async (req, res) => {
  try {
    const { text, amount, category, date } = req.body;

    if (!text || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const result = await pool.query(
      `UPDATE transactions 
       SET text=$1, amount=$2, category=$3, created_at=$4 
       WHERE id=$5 AND user_id=$6
       RETURNING *`,
      [
        text,
        Number(amount),
        category,
        date ? new Date(date) : new Date(),
        req.params.id,
        req.user.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      message: "Transaction updated",
      data: result.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
});

// =======================
// ❌ DELETE TRANSACTION
// =======================
app.delete("/transactions/:id", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM transactions WHERE id=$1 AND user_id=$2 RETURNING *",
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      message: "Transaction deleted",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
});

// =======================
// 📂 CREATE CATEGORY
// =======================
app.post("/categories", auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name required",
      });
    }

    const result = await pool.query(
      "INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING *",
      [name, req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Create category failed",
    });
  }
});

// =======================
// 📂 GET CATEGORIES
// =======================
app.get("/categories", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories WHERE user_id=$1",
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Fetch categories failed",
    });
  }
});

// =======================
// 🧠 INSIGHTS API (CLEANED)
// =======================
app.get("/insights", auth, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const year = now.getFullYear();
    const today = now.getDate();
    const totalDays = new Date(year, currentMonth, 0).getDate();

    // 🔹 1. Budget + Spending
    const budgetData = await pool.query(
      `
      SELECT 
        b.category,
        b.amount AS budget,
        COALESCE(SUM(ABS(t.amount)), 0) AS spent
      FROM budgets b
      LEFT JOIN transactions t
        ON TRIM(LOWER(b.category)) = TRIM(LOWER(t.category))
        AND t.user_id = b.user_id
        AND t.amount < 0
        AND EXTRACT(MONTH FROM t.created_at) = $2
        AND EXTRACT(YEAR FROM t.created_at) = $3
      WHERE b.user_id = $1
        AND b.month = $2
        AND b.year = $3
      GROUP BY b.category, b.amount
      `,
      [req.user.id, currentMonth, year]
    );

    // 🔹 2. Trends
    const trendsData = await pool.query(
      `
      SELECT 
        TRIM(LOWER(category)) AS category,
        SUM(CASE 
          WHEN EXTRACT(MONTH FROM created_at) = $2 THEN ABS(amount)
          ELSE 0 END) AS current,
        SUM(CASE 
          WHEN EXTRACT(MONTH FROM created_at) = $3 THEN ABS(amount)
          ELSE 0 END) AS previous
      FROM transactions
      WHERE user_id = $1
        AND amount < 0
        AND EXTRACT(YEAR FROM created_at) = $4
      GROUP BY TRIM(LOWER(category))
      `,
      [req.user.id, currentMonth, previousMonth, year]
    );

    const insights = [];

    // 🔥 Budget intelligence
    budgetData.rows.forEach((item) => {
      const spent = Number(item.spent);
      const budget = Number(item.budget);

      if (budget === 0) return;

      const percent = (spent / budget) * 100;
      const daily = spent / today;
      const allowedDaily = budget / totalDays;

      if (percent > 80 && percent < 100) {
        insights.push({
          type: "warning",
          message: `${item.category}: ${percent.toFixed(
            0
          )}% of budget used in ${today} days`,
        });
      }

      if (percent >= 100) {
        insights.push({
          type: "danger",
          message: `${item.category}: Budget exceeded by ₹${(
            spent - budget
          ).toFixed(0)}`,
        });
      }

      if (daily > allowedDaily) {
        const reduceBy = (daily - allowedDaily).toFixed(0);
        insights.push({
          type: "info",
          message: `${item.category}: Reduce ₹${reduceBy}/day to stay within budget`,
        });
      }
    });

    // 🔥 Trend intelligence
    let worstCategory = null;
    let maxIncrease = 0;

    trendsData.rows.forEach((item) => {
      const current = Number(item.current);
      const previous = Number(item.previous);

      if (previous === 0) return;

      const percentChange = ((current - previous) / previous) * 100;

      if (percentChange > maxIncrease) {
        maxIncrease = percentChange;
        worstCategory = item.category;
      }
    });

    if (worstCategory && maxIncrease > 20) {
      insights.push({
        type: "danger",
        message: `Top increase: ${worstCategory} (+${maxIncrease.toFixed(
          0
        )}%)`,
      });
    }

    // ✅ FINAL RESPONSE (FIXED)
    res.json({
      success: true,
      data: insights,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Insights failed",
    });
  }
});
// =======================
// 💰 CREATE BUDGET
// =======================
app.post("/budgets", auth, async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    if (!category || !amount || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    // 🔥 CHECK if already exists
    const existing = await pool.query(
      `SELECT * FROM budgets 
       WHERE user_id=$1 AND LOWER(category)=LOWER($2) AND month=$3 AND year=$4`,
      [req.user.id, category, month, year]
    );

    let result;

    if (existing.rows.length > 0) {
      // ✅ UPDATE instead of duplicate insert
      result = await pool.query(
        `UPDATE budgets 
         SET amount=$1 
         WHERE user_id=$2 AND LOWER(category)=LOWER($3) AND month=$4 AND year=$5
         RETURNING *`,
        [Number(amount), req.user.id, category, month, year]
      );
    } else {
      // ✅ INSERT new
      result = await pool.query(
        `INSERT INTO budgets (user_id, category, amount, month, year)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [req.user.id, category, Number(amount), month, year]
      );
    }

    res.json({
      success: true,
      data: result.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to save budget",
    });
  }
});

// =======================
// 📥 GET BUDGETS
// =======================
app.get("/budgets", auth, async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year required",
      });
    }

    const data = await pool.query(
      `SELECT * FROM budgets 
       WHERE user_id=$1 AND month=$2 AND year=$3`,
      [req.user.id, month, year]
    );

    res.json({
      success: true,
      data: data.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch budgets",
    });
  }
});

// =======================
// 📊 BUDGET INSIGHTS
// =======================
app.get("/budget-insights", auth, async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const result = await pool.query(
      `
      SELECT 
        b.category,

        -- ✅ FIX: prevent duplication from JOIN
        MAX(b.amount) AS budget,

        -- ✅ correct spending calculation
        COALESCE(SUM(ABS(t.amount)), 0) AS spent

      FROM budgets b

      LEFT JOIN transactions t
        ON TRIM(LOWER(t.category)) = TRIM(LOWER(b.category))
        AND EXTRACT(MONTH FROM t.created_at) = $2
        AND EXTRACT(YEAR FROM t.created_at) = $3
        AND t.user_id = b.user_id
        AND t.amount < 0

      WHERE b.user_id = $1 
        AND b.month = $2
        AND b.year = $3

      GROUP BY b.category
      `,
      [req.user.id, month, year]
    );

    res.json({
      success: true,
      data: result.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Budget insights failed",
    });
  }
});
// =======================
// 🧠 SMART ALERTS (CLEANED)
// =======================
app.get("/smart-alerts", auth, async (req, res) => {
  try {
    const now = new Date();

    let currentMonth = now.getMonth() + 1;
    let lastMonth = currentMonth - 1;
    let year = now.getFullYear();
    let lastMonthYear = year;

    const today = now.getDate();
    const totalDays = new Date(year, currentMonth, 0).getDate();

    // ✅ HANDLE JAN EDGE CASE
    if (lastMonth === 0) {
      lastMonth = 12;
      lastMonthYear = year - 1;
    }

    // =========================
    // 🔹 CATEGORY SPENDING
    // =========================
    const trends = await pool.query(
      `
      SELECT 
        TRIM(LOWER(category)) AS category,
        SUM(CASE 
          WHEN EXTRACT(MONTH FROM created_at) = $2 
           AND EXTRACT(YEAR FROM created_at) = $4
          THEN ABS(amount)
          ELSE 0 END) AS current,
        SUM(CASE 
          WHEN EXTRACT(MONTH FROM created_at) = $3 
           AND EXTRACT(YEAR FROM created_at) = $5
          THEN ABS(amount)
          ELSE 0 END) AS previous
      FROM transactions
      WHERE user_id = $1
        AND amount < 0
      GROUP BY TRIM(LOWER(category))
      `,
      [req.user.id, currentMonth, lastMonth, year, lastMonthYear]
    );

    // =========================
    // 🔹 BUDGETS
    // =========================
    const budgets = await pool.query(
      `
      SELECT category, amount
      FROM budgets
      WHERE user_id = $1
        AND month = $2
        AND year = $3
      `,
      [req.user.id, currentMonth, year]
    );

    const budgetMap = {};
    budgets.rows.forEach((b) => {
      budgetMap[b.category.trim().toLowerCase()] = Number(b.amount);
    });

    const insights = [];

    let topCategory = null;
    let maxSpend = 0;
    let biggestIncrease = 0;
    let worstCategory = null;

    // =========================
    // 🔥 MAIN LOGIC
    // =========================
    trends.rows.forEach((item) => {
      const category = item.category;
      const current = Number(item.current) || 0;
      const previous = Number(item.previous) || 0;
      const budget = budgetMap[category];

      if (current > maxSpend) {
        maxSpend = current;
        topCategory = category;
      }

      // 🆕 New spending
      if (previous === 0 && current > 0) {
        insights.push({
          type: "highlight",
          message: `${category}: new spending started this month`,
        });
      }

      // 📈 Growth
      if (previous > 0) {
        const percent = ((current - previous) / previous) * 100;

        if (percent > biggestIncrease) {
          biggestIncrease = percent;
          worstCategory = category;
        }

        if (percent > 30) {
          insights.push({
            type: "danger",
            message: `${category}: spending increased by ${percent.toFixed(0)}%`,
          });
        }
      }

      // =========================
      // 💰 BUDGET LOGIC
      // =========================
      if (budget && budget > 0) {
        const usedPercent = (current / budget) * 100;
        const daily = current / today;
        const allowedDaily = budget / totalDays;
        const projected = daily * totalDays;

        if (usedPercent >= 80 && current < budget) {
          insights.push({
            type: "warning",
            message: `${category}: ${usedPercent.toFixed(0)}% of budget used`,
          });
        }

        if (current >= budget) {
          insights.push({
            type: "danger",
            message: `${category}: budget exceeded by ₹${(current - budget).toFixed(0)}`,
          });
        }

        if (daily > allowedDaily) {
          const reduce = Math.ceil(daily - allowedDaily);

          insights.push({
            type: "info",
            message: `${category}: reduce ₹${reduce}/day`,
          });
        }

        if (projected > budget && current < budget) {
          insights.push({
            type: "warning",
            message: `${category}: will exceed budget at current pace`,
          });
        }
      }
    });

    // 🔥 TOP CATEGORY
    if (topCategory) {
      insights.push({
        type: "highlight",
        message: `Top spending: ${topCategory} (₹${maxSpend})`,
      });
    }

    // 🔥 WORST INCREASE
    if (worstCategory && biggestIncrease > 20) {
      insights.push({
        type: "danger",
        message: `Highest increase: ${worstCategory} (+${biggestIncrease.toFixed(0)}%)`,
      });
    }

    // 🔥 EMPTY STATE
    if (insights.length === 0) {
      insights.push({
        type: "info",
        message: "Spending is stable. No unusual activity detected.",
      });
    }

    // ✅ FINAL RESPONSE (FIXED)
    res.json({
      success: true,
      data: insights,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Smart insights failed",
    });
  }
});
// =======================
// 📈 SPENDING TRENDS (CLEANED)
// =======================
app.get("/spending-trends", auth, async (req, res) => {
  try {
    const now = new Date();

    let currentMonth = now.getMonth() + 1;
    let lastMonth = currentMonth - 1;
    let year = now.getFullYear();
    let lastMonthYear = year;

    // ✅ HANDLE JAN EDGE CASE
    if (lastMonth === 0) {
      lastMonth = 12;
      lastMonthYear = year - 1;
    }

    const result = await pool.query(
      `
      SELECT 
        TRIM(LOWER(category)) AS category,
        SUM(CASE 
              WHEN EXTRACT(MONTH FROM created_at) = $2 
                   AND EXTRACT(YEAR FROM created_at) = $4
              THEN ABS(amount)
              ELSE 0 
            END) AS current,
        SUM(CASE 
              WHEN EXTRACT(MONTH FROM created_at) = $3 
                   AND EXTRACT(YEAR FROM created_at) = $5
              THEN ABS(amount)
              ELSE 0 
            END) AS previous
      FROM transactions
      WHERE user_id = $1
        AND amount < 0
      GROUP BY TRIM(LOWER(category))
      `,
      [req.user.id, currentMonth, lastMonth, year, lastMonthYear]
    );

    const trends = result.rows.map((item) => {
      const current = Number(item.current) || 0;
      const previous = Number(item.previous) || 0;
      const diff = current - previous;

      let percent = 0;
      let trend = "neutral";

      if (previous === 0 && current > 0) {
        trend = "new";
        percent = 100;
      } else if (previous > 0 && current === 0) {
        trend = "down";
        percent = 100;
      } else if (previous > 0) {
        percent = (diff / previous) * 100;
        trend = diff > 0 ? "up" : diff < 0 ? "down" : "neutral";
      }

      return {
        category: item.category,
        current,
        previous,
        change: diff,
        percent: Number(percent.toFixed(1)), // ✅ always number
        trend,
      };
    });

    // ✅ FINAL RESPONSE (CONSISTENT)
    res.json({
      success: true,
      data: trends,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Trend fetch failed",
    });
  }
});
app.get("/budget-predictions", auth, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const year = now.getFullYear();
    const today = now.getDate();

    const totalDays = new Date(year, currentMonth, 0).getDate();
    const daysRemaining = totalDays - today;

    const result = await pool.query(
      `
      SELECT 
        b.category,
        b.amount AS budget,
        COALESCE(SUM(ABS(t.amount)), 0) AS spent
      FROM budgets b
      LEFT JOIN transactions t
        ON TRIM(LOWER(b.category)) = TRIM(LOWER(t.category))
        AND t.user_id = b.user_id
        AND t.amount < 0
        AND EXTRACT(MONTH FROM t.created_at) = $2
        AND EXTRACT(YEAR FROM t.created_at) = $3
      WHERE b.user_id = $1
        AND b.month = $2
        AND b.year = $3
      GROUP BY b.category, b.amount
      `,
      [req.user.id, currentMonth, year]
    );

    const predictions = result.rows.map((item) => {
      const spent = Number(item.spent);
      const budget = Number(item.budget);

      const daily = spent / today;

      // 🚨 exceeded
      if (spent >= budget) {
        return {
          category: item.category,
          status: "exceeded",
        };
      }

      // ⚪ no spending
      if (daily === 0) {
        return {
          category: item.category,
          status: "no_data",
        };
      }

      const projectedTotal = daily * totalDays;

      // ⚠️ will exceed
      if (projectedTotal > budget) {
        return {
          category: item.category,
          status: "warning",
          message: "You will exceed budget at current pace",
        };
      }

      // ✅ safe
      return {
        category: item.category,
        status: "safe",
        message: "Spending is under control",
      };
    });

    res.json(predictions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Prediction failed" });
  }
});
// =======================
// 📊 MONTHLY COMPARISON
// =======================
app.get("/monthly-comparison", auth, async (req, res) => {
  try {
    const year = new Date().getFullYear();

    const result = await pool.query(
      `
      SELECT 
        EXTRACT(MONTH FROM created_at) AS month,
        SUM(ABS(amount)) AS total
      FROM transactions
      WHERE user_id = $1
        AND amount < 0
        AND EXTRACT(YEAR FROM created_at) = $2
      GROUP BY month
      ORDER BY month
      `,
      [req.user.id, year]
    );

    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const data = Array.from({ length: 12 }, (_, i) => {
      const found = result.rows.find(
        (r) => Number(r.month) === i + 1
      );

      return {
        month: months[i],
        amount: found ? Number(found.total) : 0,
      };
    });

    res.json({
      success: true,
      data,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Monthly data failed",
    });
  }
});

// =======================
// 📊 SUMMARY
// =======================
app.get("/summary", auth, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const year = now.getFullYear();
    const today = now.getDate();
    const totalDays = new Date(year, currentMonth, 0).getDate();

    // 🔹 TOTAL SPENDING
    const totalRes = await pool.query(
      `
      SELECT COALESCE(SUM(ABS(amount)), 0) AS total
      FROM transactions
      WHERE user_id = $1
        AND amount < 0
        AND EXTRACT(MONTH FROM created_at) = $2
        AND EXTRACT(YEAR FROM created_at) = $3
      `,
      [req.user.id, currentMonth, year]
    );

    const totalSpent = Number(totalRes.rows[0].total) || 0;

    // 🔹 TOP CATEGORY
    const categoryRes = await pool.query(
      `
      SELECT TRIM(LOWER(category)) AS category, SUM(ABS(amount)) AS total
      FROM transactions
      WHERE user_id = $1
        AND amount < 0
        AND EXTRACT(MONTH FROM created_at) = $2
        AND EXTRACT(YEAR FROM created_at) = $3
      GROUP BY TRIM(LOWER(category))
      ORDER BY total DESC
      LIMIT 1
      `,
      [req.user.id, currentMonth, year]
    );

    const topCategory =
      categoryRes.rows.length > 0
        ? categoryRes.rows[0].category
        : null;

    const topAmount =
      categoryRes.rows.length > 0
        ? Number(categoryRes.rows[0].total)
        : 0;

    // 🔥 MESSAGE LOGIC
    let message = "";

    if (totalSpent === 0) {
      message = "No spending recorded this month.";
    } else {
      message += `You spent ₹${totalSpent.toLocaleString("en-IN")} this month. `;

      if (topCategory) {
        message += `Highest: ${topCategory} (₹${topAmount}). `;
      }

      const daily = totalSpent / today;
      const projected = daily * totalDays;

      if (projected > totalSpent * 1.2) {
        const reduce = Math.ceil((projected - totalSpent) / totalDays);
        message += `Reduce ~₹${reduce}/day to stay on track.`;
      } else {
        message += `Spending is under control.`;
      }
    }

    res.json({
      success: true,
      data: {
        totalSpent,
        topCategory,
        message,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Summary failed",
    });
  }
});
// =======================
// 📥 EXPORT CSV
// =======================
app.get("/export-csv", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT text, amount, category, created_at
       FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const rows = result.rows;

    // ✅ CSV HEADER
    let csv = "Text,Amount,Category,Date\n";

    // ✅ ADD DATA
    rows.forEach((row) => {
      csv += `"${row.text}",${row.amount},"${row.category}","${row.created_at}"\n`;
    });

    // ✅ RESPONSE HEADERS
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=transactions.csv"
    );

    res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "CSV export failed",
    });
  }
});

// =======================
// 🚀 START SERVER
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});