const express = require("express");
const cors = require("cors");
const { PORT, BOT_TOKEN } = require("./constants/.envirment");
const ConnectionToDB = require("./configs/db.config");
const { Telegraf } = require("telegraf");
const Markup = require("telegraf/markup");
const setUpSwagger = require("./utils/swagger");
const { initSuperAdmin } = require("./controllers/admin.controller");

const app = express();
const bot = new Telegraf(BOT_TOKEN);

app.use(express.json());
app.use(cors({ origin: "*" }));

bot.start(async (ctx) => {
  await ctx.reply(
    `🌟 Assalomu alaykum! 🌟
 
✈️ "Arabistonga Biletlar" botiga xush kelibsiz!
 
Biz sizga Saudiya Arabistoni kabi Yaqin Sharq davlatlariga eng qulay va arzon aviachiptalarni topishda yordam beramiz.
 
Marhamat, qaysi yo'nalishga (shahar yoki davlatga) uchmoqchisiz?
 
⬇️⬇️⬇️`,
    Markup.inlineKeyboard([
      Markup.button.callback("Borish ✈️", "go"),
      Markup.button.callback("Qaytish 🏡", "return"),
    ])
  );
});

bot.action("go", async (ctx) => {
  await ctx.reply(
    "Sana bo'yicha 📅: Agar siz aniq bir sanada yoki davrda amal qiluvchi tadbirlar/sayohatlar/aksiyalarni qidirayotgan bo'lsangiz, ushbu bo'limni tanlang.\n\n" +
      "Sotuvda 🏷️: Agar hozirda tezkor sotuvga qo'yilgan yoki chegirmali takliflarni ko'rmoqchi bo'lsangiz, ushbu bo'limga o'ting.",
    Markup.inlineKeyboard([
      [
        Markup.button.callback("Sana bo`yicha 📅", "by_date"),
        Markup.button.callback("Sotuvda 🏷️", "on_sale"),
      ],
    ])
  );
});

bot.action("return", async (ctx) => {
  await ctx.reply(
    "Sana bo'yicha 📅: Agar siz aniq bir sanada yoki davrda amal qiluvchi tadbirlar/sayohatlar/aksiyalarni qidirayotgan bo'lsangiz, ushbu bo'limni tanlang.\n\n" +
      "Sotuvda 🏷️: Agar hozirda tezkor sotuvga qo'yilgan yoki chegirmali takliflarni ko'rmoqchi bo'lsangiz, ushbu bo'limga o'ting.",
    Markup.inlineKeyboard([
      [
        Markup.button.callback("Sana bo`yicha 📅", "by_date"),
        Markup.button.callback("Sotuvda 🏷️", "on_sale"),
      ],
    ])
  );
});

bot.launch();

setUpSwagger(app);

const AdminRouter = require("./routes/admin.route");
app.use("/api", AdminRouter);

const OrderRouter = require("./routes/order.route");
app.use("/api", OrderRouter);

ConnectionToDB();
initSuperAdmin();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

module.exports = app;
