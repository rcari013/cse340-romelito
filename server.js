const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./database/");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const utilities = require("./utilities");
const staticRoutes = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
app.locals.utilities = utilities;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// View Engine (EJS) + Layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* =============================
 *  CORRECT MIDDLEWARE ORDER
 * ============================= */

// 1. Cookie parser FIRST
app.use(cookieParser());

// 2. Session middleware
app.use(
  session({
    store: new pgSession({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    name: "sessionId",
  })
);

// 3. Flash AFTER session
app.use(flash());

// 4. Flash messages into res.locals
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// 5. Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 6. JWT auth check AFTER flash
app.use(utilities.checkJWTToken);

/* =============================
 *  ROUTES
 * ============================= */

// Static routes (CSS, images, favicon, etc.)
app.use(staticRoutes);

// Home page
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory
app.use("/inv", inventoryRoute);

// Appointments
app.use("/appointment", require("./routes/appointmentRoute"));

// Accounts
app.use("/account", require("./routes/accountRoute"));

// Database Check Route
const { Client } = require("pg");
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

/* =============================
 *  SERVER START
 * ============================= */

const port = process.env.PORT || 5500;
const host = process.env.HOST || "0.0.0.0";

app.listen(port, host, () => {
  console.log(`✅ Server running at http://${host}:${port}`);
});

/* =============================
 *  404 Handler
 * ============================= */

app.use(async (req, res, next) => {
  next({
    status: 404,
    message: "Sorry, we appear to have lost that page.",
  });
});

/* =============================
 *  FINAL ERROR HANDLER
 * ============================= */

app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message: err.message || "Something went wrong.",
    nav,
  });
});
