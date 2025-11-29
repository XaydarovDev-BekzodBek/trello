const { Schema, model } = require("mongoose");

const OrderClientSchema = new Schema(
  {
    userId: { type: Schema.ObjectId, ref: "BotClient" },
    people: { type: Number },
    username: { type: String, defaultValue: "" },
    phone: { type: String, defaultValue: "" },
  },
  { timestamps: true }
);

const OrderSchema = new Schema(
  {
    direction: { type: String, required: true },
    direction_to: { type: String, required: true },
    bagaj: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    arrive_time: { type: String, defaultValue: "" },
    price: { type: String, required: true },
    clients: [OrderClientSchema],
    buyed_ticket: { type: Number },
    is_acitve: { type: Boolean, defaultValue: false },
    company: { type: String, defaultValue: "" },
    bilet_id: { type: String, defaultValue: "" },
    type: { type: String, enum: ["go", "return", "alone"], required: true },
  },
  { timestamps: true }
);

const OrderModel = model("order", OrderSchema);
module.exports = OrderModel;
