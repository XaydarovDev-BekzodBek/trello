require("dotenv").config({ quiet: true });

module.exports = {
  PORT: process.env.PORT || 9000,
  MONGO_URL: process.env.MONGO_URL || "mongodb://localhost:27017/db",
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  BOT_TOKEN:process.env.BOT_TOKEN ||""
};
