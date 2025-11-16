const { Schema, model } = require("mongoose");

const BotClientSchema = new Schema({
  chat_id: { type: String, required: true },
  username: { type: String, required: true },
  full_name: { type: String, required: true },
  language: { type: String, defaultValue: "" },
});

const BotClientModel = model("BotClient",BotClientSchema)

module.exports = BotClientModel