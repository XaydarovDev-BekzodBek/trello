const { Telegraf } = require("telegraf");
const Markup = require("telegraf/markup");
const { BOT_TOKEN } = require("../constants/.envirment");
const { BotClientModel, OrderModel } = require("../models");
const languages = require("../languages");

const bot = new Telegraf(BOT_TOKEN);
const deleteChatIds = new Map();

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
  const date = new Date()


  switch (oldUser.progress) {
    case "choose_region":
        const orders = await OrderModel.find({direction:ctx.message.text,date})
        break;
  
    default:
        break;
  }
});

bot.action("borish", async (ctx) => {
  const oldUser = await findUser(ctx);
  const regions = languages[oldUser.language || "uzb"]["regions"];
  const formated = [];
  for (let i = 0; i < regions.length; i += 3) {
    formated.push(regions.slice(i, i + 3));
  }

  oldUser.progress = "choose_region";
  await oldUser.save();
  await ctx.reply(
    "Borish uchun birinchi o`rinda Shahar tanlang!",
    Markup.keyboard(formated)
  );
});

bot.action("qaytish", async (ctx) => {});

module.exports = bot;
