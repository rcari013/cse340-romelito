const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const dotenv = require("dotenv")
const { Client } = require("pg")
const path = require("path")
const staticRoutes = require("./routes/static")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities")
const inventoryRoute = require("./routes/inventoryRoute") // ✅ Added this line

dotenv.config()

const app = express()

// Serve static files
app.use(express.static(path.join(__dirname, "public")))

// View Engine and Layouts
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

// Middleware
app.use(staticRoutes)

// Index Route (MVC approach)
app.get("/", utilities.handleErrors(baseController.buildHome))


// Inventory routes
app.use("/inv", inventoryRoute)

// Database Check Route
app.get("/db-check", async (req, res) => {
  try {
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    const result = await client.query("SELECT NOW()")
    await client.end()
    res.send(`✅ Database connected! Server time: ${result.rows[0].now}`)
  } catch (err) {
    res.send(`❌ Database connection failed: ${err.message}`)
  }
})

// Server Info
const port = process.env.PORT || 5500
const host = process.env.HOST || "0.0.0.0"

app.listen(port, host, () => {
  console.log(`✅ Server running at http://${host}:${port}`)
})

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' })
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  let message
  if (err.status == 404) {
    message = err.message
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?"
  }

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  })
})
