const express = require("express");
const cors = require("cors");
const { PORT } = require("./constants/.envirment");
const ConnectionToDB = require("./configs/db.config");
const setUpSwagger = require("./utils/swagger");
const { initSuperAdmin } = require("./controllers/admin.controller");
const { bot } = require("./bot");
const cron = require("node-cron");
const jobsConfig = require("./json/node-cron.json");
const { OrderModel } = require("./models");

const app = express();
const WEBHOOK_PATH = "/tg_webhook_1a2b3c4d5e6f7g8h9i0j";

app.use(express.json());
app.use(cors({ origin: "*" }));

setUpSwagger(app);

const AdminRouter = require("./routes/admin.route");
app.use("/api", AdminRouter);

const OrderRouter = require("./routes/order.route");
app.use("/api", OrderRouter);

const GroupIdRouter = require("./routes/groupid.route");
app.use("/api", GroupIdRouter);

const StatsRouter = require("./routes/stats.route");
app.use("/api", StatsRouter);

// app.use(bot.webhookCallback(WEBHOOK_PATH));

// bot.launch({
//   webhook: {
//     domain: "trello.techinfo.uz",
//     port: 443,
//     path: "/tg_webhook_1a2b3c4d5e6f7g8h9i0j",
//   },
// });
bot.launch()
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

const tasks = {
  sendDailyReports: async () => {
    const date = new Date().toISOString().split("T")[0];
    await OrderModel.updateMany(
      { date: { $lt: date } },
      { is_acitve: true },
      { new: true }
    );
    console.log("Daily reports sent! (" + new Date().toLocaleString() + ")");
  },
};

jobsConfig.forEach((job) => {
  if (tasks[job.name]) {
    cron.schedule(job.schedule, tasks[job.name], {
      scheduled: true,
      timezone: "Asia/Tashkent",
    });
    console.log(`Job rejalashtirildi: ${job.name} - Jadval: ${job.schedule}`);
  } else {
    console.error(`Xato: ${job.name} funksiyasi topilmadi.`);
  }
});



app.listen(PORT, () => {
  ConnectionToDB();
  initSuperAdmin();
  console.log("app is running");
  // bot.telegram.setWebhook(`https://trello.techinfo.uz${WEBHOOK_PATH}`);

  console.log("Webhook o'rnatildi.");
});
