require("dotenv").config();
const { Client } = require("pg");

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Render’s SSL
    },
  });

  try {
    console.log("🔄 Connecting to database...");
    await client.connect();
    const res = await client.query("SELECT NOW()");
    console.log("✅ Connected! Server time:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  } finally {
    await client.end();
  }
}

testConnection();
