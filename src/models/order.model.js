const { Schema, model } = require("mongoose");

const OrderClientSchema = new Schema(
  {
    userId: { type: Schema.ObjectId, required: true, ref: "BotClient" },
  },
  { timestamps: true }
);

const OrderSchema = new Schema(
  {
    direction: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    arrive_time: { type: String, defaultValue: "" },
    price: { type: String, required: true },
    clients: [OrderClientSchema],
    limit_of_clients: { type: Number, required: true },
    is_acitve: { type: Boolean, defaultValue: false },
    company: { type: String, defaultValue: "" },
    bilet_id: { type: String, defaultValue: "" },
    type: { type: String, enum: ["go", "return"], required: true },
  },
  { timestamps: true }
);

const OrderModel = model("order", OrderSchema);
module.exports = OrderModel;
