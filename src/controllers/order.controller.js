const { sendTodayTicketsNotification } = require("../bot");
const { OrderModel } = require("../models");

exports.CreateOrder = async (req, res) => {
  try {
    const {
      direction,
      direction_to,
      bagaj,
      date,
      time,
      price,
      type,
      company,
      buyed_ticket,
      bilet_id,
      arrive_time,
    } = req.body;

    const order = await OrderModel.create({
      direction,
      direction_to,
      bagaj,
      date,
      time,
      price,
      clients: [],
      is_acitve: false,
      type,
      company,
      buyed_ticket,
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
    const startDate = req.query?.start?.split("T")[0];
    const orders = startDate
      ? await OrderModel.find({
          date: { $gte: startDate },
        }).populate("clients.userId")
      : await OrderModel.find({}).populate("clients.userId");

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
    const {
      direction,
      date,
      time,
      price,
      buyed_ticket,
      type,
      direction_to,
      bagaj,
    } = req.body;

    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        direction,
        date,
        time,
        price,
        buyed_ticket,
        type,
        direction_to,
        bagaj,
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

exports.addPeopel = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { people } = req.body;

    const order = await OrderModel.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "order not found" });
    }
    const user = order.clients.find((i) => i._id.toString() == userId);

    user.people = people;

    await order.save();

    return res.status(200).json({ message: "people added" });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const order = await OrderModel.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "order not found" });
    }

    order.clients = order.clients.filter((i) => i._id.toString() !== userId);
    await order.save();

    return res.status(200).json({ message: "client deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

exports.addClient = async (req, res) => {
  try {
    const { username, phone } = req.body;
    const { id } = req.params;

    const order = await OrderModel.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "order not found" });
    }

    order.clients.push({ username, phone });
    await order.save();

    return res.status(200).json({ message: "client added" });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

exports.sendTodayTickets = async (req, res) => {
  const { date } = req.body;

  if (!date) {
    return res
      .status(400)
      .json({ success: false, message: "Sana (date) maydoni majburiy." });
  }

  try {
    const todayTickets = await OrderModel.find({ date: { $gte: date } })
      .populate({
        path: "clients.userId",
        select: "full_name phone username",
      })
      .sort({ time: 1 });



    await sendTodayTicketsNotification(date, todayTickets);

    res.status(200).json({
      success: true,
      message: `${todayTickets.length} ta bilet Telegram guruhlariga yuborish jarayoniga qo'shildi.`,
    });
  } catch (error) {
    console.error("Telegramga bilet yuborishda xato:", error);
    res
      .status(500)
      .json({
        success: false,
        message:
          "Telegramga xabar yuborishda kutilmagan xatolik. Loglarni tekshiring.",
      });
  }
};
