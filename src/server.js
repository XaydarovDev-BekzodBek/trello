const express = require("express");
const cors = require("cors");
const { PORT } = require("./constants/.envirment");
const ConnectionToDB = require("./configs/db.config");
const setUpSwagger = require("./utils/swagger");
const { initSuperAdmin } = require("./controllers/admin.controller");
const bot = require("./bot");

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

setUpSwagger(app);

const AdminRouter = require("./routes/admin.route");
app.use("/api", AdminRouter);

const OrderRouter = require("./routes/order.route");
app.use("/api", OrderRouter);

const GroupIdRouter = require("./routes/groupid.route");
app.use("/api", GroupIdRouter);

bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

app.listen(PORT, () => {
  ConnectionToDB();
  initSuperAdmin();
  console.log("app is running");
});
