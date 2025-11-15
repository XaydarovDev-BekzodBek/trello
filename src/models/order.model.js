const { Schema, model } = require("mongoose");

const OrderClientSchema = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { timestamps: true }
);

const OrderSchema = new Schema(
  {
    direction: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    price: { type: String, required: true },
    clients: [OrderClientSchema],
    limit_of_clients: { type: Number, required: true },
    is_acitve: { type: Boolean, defaultValue: false },
  },
  { timestamps: true }
);

const OrderModel = model("order", OrderSchema);
module.exports = OrderModel;