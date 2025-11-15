const { OrderModel } = require("../models");

exports.CreateOrder = async (req, res) => {
  try {
    const { direction, date, time, price, limit_of_clients } = req.body;

    const order = await OrderModel.create({
      direction,
      date,
      time,
      price,
      limit_of_clients,
      clients: [],
      is_acitve: false,
    });

    return res
      .status(201)
      .json({ success: true, message: "order created", order });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find({});

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

exports.UpdateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { direction, date, time, price, limit_of_clients } = req.body;

    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        direction,
        date,
        time,
        price,
        limit_of_clients,
      },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

