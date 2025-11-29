const { Schema, model } = require("mongoose");

const BotClientSchema = new Schema({
  chat_id: { type: String, required: true },
  username: { type: String, defaultValue: "" },
  full_name: { type: String, defaultValue: "" },
  phone: { type: String, defaultValue: "" },
  language: { type: String, defaultValue: "" },
  progress: { type: String, defaultValue: "" },
});

const BotClientModel = model("BotClient", BotClientSchema);

module.exports = BotClientModel;
