const { Telegraf } = require("telegraf");
const Markup = require("telegraf/markup");
const { BOT_TOKEN } = require("../constants/.envirment");
const { BotClientModel, OrderModel } = require("../models");
const languages = require("../languages");

const bot = new Telegraf(BOT_TOKEN);
const deleteChatIds = new Map();

// bu users teskor ma`lumot saqlab qo`ygani cache kabi
const users = new Map();

const findUser = async (ctx) => {
  const user = await BotClientModel.findOne({ chat_id: ctx.chat.id });
  if (!user) {
    const newUser = await BotClientModel.create({
      chat_id: ctx.chat.id,
      username: ctx.chat.username,
      full_name: ctx.chat.first_name + " " + ctx.chat.last_name,
      language: "",
    });
    console.log("user created");
    return newUser;
  } else {
    return user;
  }
};

bot.start(async (ctx) => {
  const oldUser = await findUser(ctx);
  oldUser.progress = "choose_lang";
  await oldUser.save();
  if (oldUser.language == "") {
    const reply = await ctx.reply(
      `Assalomu alaykum!
O‘zingizga qulay tilni tanlang 🇺🇿

Ассалому алайкум!
Ўзингизга қулай тилни танланг 🇺🇿

Здравствуйте!
Выберите удобный для вас язык 🇷🇺`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback("🇺🇿 O`zbekcha", "language_uzb"),
          Markup.button.callback("🇺🇿 Узбекча", "language_lotin"),
          Markup.button.callback("🇷🇺 Русский", "language_rus"),
        ],
      ])
    );
    deleteChatIds.set(reply.chat.id, reply.message_id);
  } else {
    await ctx.reply(
      languages[oldUser.language || "uzb"]["welcome"],
      Markup.inlineKeyboard([
        Markup.button.callback(
          languages[oldUser.language || "uzb"]["buttons"][0],
          "borish"
        ),
        Markup.button.callback(
          languages[oldUser.language || "uzb"]["buttons"][1],
          "qaytish"
        ),
      ])
    );
  }
});

bot.action("language_uzb", async (ctx) => {
  const oldUser = await findUser(ctx);
  oldUser.language = "uzb";
  oldUser.progress = "choose_direction";
  await oldUser.save();
  await ctx.reply(
    languages["uzb"]["welcome"],
    Markup.inlineKeyboard([
      Markup.button.callback(languages["uzb"]["buttons"][0], "borish"),
      Markup.button.callback(languages["uzb"]["buttons"][1], "qaytish"),
    ])
  );
  const deleteId = deleteChatIds.get(ctx.chat.id);
  await ctx.deleteMessage(deleteId);
});

bot.on("text", async (ctx) => {
  const oldUser = await findUser(ctx);
  const date = new Date();
  const user = users.get(oldUser._id.toString());
  const progress = oldUser.progress.split("__")[0];
  const progressValue = oldUser.progress.split("__")[1];
  switch (progress) {
    case "choose_region":
      const orders = await OrderModel.find({
        direction: ctx.message.text,
        is_acitve: false,
        type: progressValue,
      });
      let replyText = `BISMILLAH \nARZON ${
        progressValue === "go" ? "BORISH" : "QAYTISH"
      } BILETLARI \n`;
      const buttons = [];
      const formated = [];

      if (orders.length === 0) {
        replyText += "";
      } else {
        for (let i = 0; i < orders.length; i++) {
          const order = orders[i];
          replyText += `\n${i + 1}. 🗓 Sana: ${order.date}`;
          buttons.push(
            Markup.button.callback(i + 1, `choose_ticket_${order._id}`)
          );
        }
      }

      for (let i = 0; i < buttons.length; i += 4) {
        formated.push(buttons.slice(i, i + 4));
      }

      await ctx.reply(replyText, Markup.inlineKeyboard(formated));
      break;
    case "take_full_name":
      const full_name = ctx.message.text.split(" ");

      if (!full_name[0] || !full_name[1]) {
        await ctx.reply(
          "Siz noto`g`ri holatda yozdingiz ism familiya yozish kerak"
        );
      } else {
        oldUser.progress = "take_number";
        await oldUser.save();
        users.set(oldUser._id.toString(), { full_name, ...user });
        await ctx.reply("Iltimos telefon raqamingizni kiriting");
      }
      break;
    case "take_number":
      const number = ctx.message.text;
      const regux = /^\+998(33|55|77|88|90|91|93|94|95|97|98|99)\d{7}$/;
      const order = await OrderModel.findById(user?.ticketId);
      if (!regux.test(number)) {
        await ctx.reply("Iltimos telefon raqam xato kiritildi");
      } else {
        if (order.limit_of_clients == order.clients.length) {
          await ctx.reply("uzur bilet to`lib bo`lgan boshqa bilet oling");
        } else {
          order.clients.push({
            userId: oldUser._id,
            name: user.full_name.join(" "),
            phone: number,
          });
          oldUser.progress = "";
          await oldUser.save();
          await order.save();
          await ctx.reply("Rahmat siz bitta bilet olib qo`ydingiz");
        }
      }
      break;
    default:
      break;
  }
});

bot.action(/choose_ticket_([a-fA-F0-9]+)/, async (ctx) => {
  const id = ctx.match[0].split("_")[2];
  const order = await OrderModel.findById(id);

  if (!order) {
    await ctx.reply("Bunday bilet topilmadi !");
  } else {
    await ctx.reply(
      `🗓 Sana: ${order.date} \n⏱ Ketish vaqti: ${order.time} \n💰 To'lov: ${order.price} \n🎟 Umumiy biletlar soni: ${order.limit_of_clients} \n✅ Sotib olingan biletlar: ${order.clients.length}`,
      Markup.inlineKeyboard([
        [Markup.button.callback("Sotib olish", "buy_ticket_" + order._id)],
      ])
    );
  }
});

bot.action(/buy_ticket_([a-fA-F0-9]+)/, async (ctx) => {
  const oldUser = await findUser(ctx);
  oldUser.progress = "take_full_name";
  users.set(oldUser._id.toString(), { ticketId: ctx.match[0].split("_")[2] });
  await oldUser.save();
  await ctx.reply(
    "Iltimos Ism va familiyangizni yozing",
    Markup.removeKeyboard()
  );
});

bot.action("borish", async (ctx) => {
  const oldUser = await findUser(ctx);
  const regions = languages[oldUser.language || "uzb"]["regions"];
  const formated = [];
  for (let i = 0; i < regions.length; i += 3) {
    formated.push(regions.slice(i, i + 3));
  }

  oldUser.progress = "choose_region__go";
  await oldUser.save();
  await ctx.reply(
    "Borish uchun birinchi o`rinda Shahar tanlang!",
    Markup.keyboard(formated)
  );
});

bot.action("qaytish", async (ctx) => {
  const oldUser = await findUser(ctx);
  const regions = languages[oldUser.language || "uzb"]["regions"];
  const formated = [];
  for (let i = 0; i < regions.length; i += 3) {
    formated.push(regions.slice(i, i + 3));
  }

  oldUser.progress = "choose_region__return";
  await oldUser.save();
  await ctx.reply(
    "Qaytish uchun birinchi o`rinda Shahar tanlang!",
    Markup.keyboard(formated)
  );
});

module.exports = bot;
