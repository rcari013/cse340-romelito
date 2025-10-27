/* ******************************************
 * Primary control file for the application.
 ******************************************/

import express from "express";
import expressLayouts from "express-ejs-layouts";
import dotenv from "dotenv";
import { Client } from "pg";
import path from "path";
import { fileURLToPath } from "url";
import staticRoutes from "./routes/static.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// View Engine and Layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

// Middleware
app.use(staticRoutes);

// Index Route
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

// Database Check Route
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

// Server Info
const port = process.env.PORT || 5500;
const host = process.env.HOST || "0.0.0.0";

app.listen(port, host, () => {
  console.log(`✅ Server running at http://${host}:${port}`);
});
