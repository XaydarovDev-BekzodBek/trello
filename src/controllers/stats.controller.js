const Order = require("../models/order.model");
const moment = require("moment");

exports.getStats = async (req, res) => {
  try {
    const now = moment();

    const filters = {
      today: {
        createdAt: {
          $gte: now.clone().startOf("day").toDate(),
          $lte: now.clone().endOf("day").toDate(),
        },
      },
      week: {
        createdAt: {
          $gte: now.clone().startOf("week").toDate(),
          $lte: now.clone().endOf("week").toDate(),
        },
      },
      month: {
        createdAt: {
          $gte: now.clone().startOf("month").toDate(),
          $lte: now.clone().endOf("month").toDate(),
        },
      },
      all: {},
    };

    const buildStats = async (filter) => {
      const orders = await Order.find(filter).populate("clients.userId");

      let totalPrice = 0;
      let totalTannarxi = 0;

      orders.forEach((o, index) => {
        const totalPeople = o.clients.reduce((a, b) => a + (b.people || 0), 0);
        const p = (Number(o.price) || 0) * totalPeople;
        const b = Number(o.buyed_ticket) || 0;

        totalPrice += p;
        totalTannarxi += b;
      });

      return {
        totalPrice,
        totalTannarxi,
        profit: totalPrice - totalTannarxi,
        loss:
          totalPrice - totalTannarxi < 0 ? -(totalPrice - totalTannarxi) : 0,
        tickets: orders,
      };
    };

    const today = await buildStats(filters.today);
    const week = await buildStats(filters.week);
    const month = await buildStats(filters.month);
    const all = await buildStats(filters.all);

    return res.status(200).json({ today, week, month, all });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
};
