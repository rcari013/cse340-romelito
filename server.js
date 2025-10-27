/* ******************************************
 * Primary control file for the application.
 ******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();
const app = express();
const static = require("./routes/static");

/* ***********************
 * Middleware
 *************************/
app.use(static);

/* ***********************
 * View Engine and Layouts
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Local & Render Server Info
 *************************/
const port = process.env.PORT || 5500; // Render provides PORT automatically
const host = process.env.HOST || "0.0.0.0"; // '0.0.0.0' allows Render to accept requests

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, host, () => {
  console.log(`✅ Server running at http://${host}:${port}`);
});

/* ***********************
 * Index Route
 *************************/
app.get("/", function (req, res) {
  res.render("index", { title: "Home" });
});

/* ***********************
 * Optional: Database Check Route (for testing)
 *************************/
import pkg from "pg";
const { Client } = pkg;

app.get("/db-check", async (req, res) => {
  try {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const result = await client.query("SELECT NOW()");
    await client.end();
    res.send(`✅ Database connected! Server time: ${result.rows[0].now}`);
  } catch (err) {
    res.send(`❌ Database connection failed: ${err.message}`);
  }
});
