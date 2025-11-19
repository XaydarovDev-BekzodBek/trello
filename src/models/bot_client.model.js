const { Schema, model } = require("mongoose");

const BotClientResults = new Schema(
  {
    update_id: Number,
    my_chat_member: {
      chat: {
        id: String,
        title: String,
        type: String,
      },
      from: {
        id: String,
        is_bot: Boolean,
        first_name: String,
        last_name: String,
        username: String,
        language_code: String,
      },
      date: Number,
      old_chat_member: {
        user: {
          id: String,
          is_bot: Boolean,
          first_name: String,
          username: String,
        },
        status: String,
      },
      new_chat_member: {
        user: {
          id: String,
          is_bot: Boolean,
          first_name: String,
          username: String,
        },
        status: String,
      },
    },
  },
  { timestamps: true }
);

const BotClientSchema = new Schema({
  chat_id: { type: String, required: true },
  username: { type: String, defaultValue: "" },
  full_name: { type: String, defaultValue: "" },
  phone: { type: String, defaultValue: "" },
  language: { type: String, defaultValue: "" },
  progress: { type: String, defaultValue: "" },
  results: [BotClientResults],
});

const BotClientModel = model("BotClient", BotClientSchema);

module.exports = BotClientModel;
