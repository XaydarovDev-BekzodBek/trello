const { OrderModel } = require("../models");

exports.CreateOrder = async (req, res) => {
  try {
    const {
      direction,
      date,
      time,
      price,
      limit_of_clients,
      type,
      company,
      bilet_id,
      arrive_time,
    } = req.body;

    const order = await OrderModel.create({
      direction,
      date,
      time,
      price,
      limit_of_clients,
      clients: [],
      is_acitve: false,
      type,
      company,
      bilet_id,
      arrive_time,
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
    const startDate = req.query.start.split("T")[0];
    const orders = await OrderModel.find({
      date: { $gte: startDate },
    }).populate("clients.userId");

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
    const { direction, date, time, price, limit_of_clients, type } = req.body;

    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        direction,
        date,
        time,
        price,
        limit_of_clients,
        type,
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

exports.changeOfOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "order not found" });
    }

    order.is_acitve = !order.is_acitve;
    await order.save();
    return res
      .status(200)
      .json({ success: true, message: "order is active changed" });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await OrderModel.findByIdAndDelete(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "order not found" });
    }

    return res.status(200).json({ message: "order deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};
