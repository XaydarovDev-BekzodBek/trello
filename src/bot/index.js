const { Telegraf } = require("telegraf");
const Markup = require("telegraf/markup");
const { BOT_TOKEN } = require("../constants/.envirment");
const { BotClientModel, OrderModel, GroupIdModel } = require("../models");

const regions = [
  "Тошкент вилояти",
  "Андижон",
  "Фарғона",
  "Жиззах",
  "Хоразм",
  "Наманган",
  "Навоий",
  "Қашқадарё",
  "Самарқанд",
  "Сирдарё",
  "Сурхондарё",
  "Бухоро",
];

console.log("bot.js is running")

const adminIds = ["-5007246078"];

const bot = new Telegraf(BOT_TOKEN);
const deleteChatIds = new Map();
const users = new Map();

const findUser = async (ctx) => {
  const user = await BotClientModel.findOne({ chat_id: ctx.chat.id });
  if (!user) {
    const newUser = await BotClientModel.create({
      chat_id: ctx.chat.id,
      username: ctx.chat.username,
      language: "",
    });
    console.log("user created");
    return newUser;
  } else {
    return user;
  }
};

bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  console.log("added text");

  const isGroup = ctx.chat.type === "group" || ctx.chat.type === "supergroup";
  const oldGroup = isGroup
    ? await GroupIdModel.findOne({ groupId: chatId })
    : null;

  if (oldGroup || isGroup) {
    await ctx.reply("bot bu gurupada ishga tushmaydi");
    return;
  }

  const oldUser = await findUser(ctx);

  if (!oldUser) {
    console.error(
      `ERROR: Foydalanuvchi topilmadi/yaratilmadi! Chat ID: ${chatId}`
    );
    await ctx.reply(
      "Kechirasiz, texnik xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring."
    );
    return;
  }

  oldUser.progress = "choose_direction";
  await oldUser.save();

  const menuButtons = [
    { text: "Бориш ✈️" },
    { text: "Қайтиш 🏡" },
    { text: "Aдмин билан боғланиш 🙎🏻‍♂️" },
  ];

  if (oldUser.username && oldUser.phone) {
    menuButtons.splice(2, 0, { text: "Билетларим 🎟" });
  }

  const keyboardLayout = [menuButtons];

  await ctx.reply(
    `🌟 Ассалому алайкум! 🌟
✈️ "Арабистонга Билетлар" ботига хуш келибсиз!

Биз сизга Саудия Арабистони каби Яқин Шарқ давлатларига энг қулай ва арзон авиачипталарни топишda yordam beramiz.

Марҳамат, қайси йўналишга (шаҳар yoki давлатga) учmoqchisiz? ⬇️⬇️⬇️`,
    {
      reply_markup: {
        keyboard: keyboardLayout,
        resize_keyboard: true,
      },
    }
  );
});

bot.command("group", async (ctx) => {
  if (ctx.chat.type === "group") {
    const chatId = ctx.chat.id;
    const oldGroup = await GroupIdModel.findOne({ groupId: chatId });
    if (oldGroup) {
      await ctx.reply("bot bu gurupada bor");
    } else {
      await GroupIdModel.create({ groupId: chatId });
      await ctx.reply("Bot bu gurupada ishga tushdi");
    }
  }
});

bot.on("text", async (ctx) => {
  const oldUser = await findUser(ctx);
  const progress = oldUser.progress.split("__")[0];
  const progressValue = oldUser.progress.split("__")[1];
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const todayStr = `${yyyy}-${mm}-${dd}`;

  if (ctx.message.text == "Билетларим 🎟") {
    let text = "";
    const orders = await OrderModel.find({
      "clients.userId": oldUser._id,
      is_acitve: false,
    });
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      text += `\n✈️ Йўналиш: ${order.direction}`;
      text += `\n✈️ Қаерга бориш: ${order.direction_to}`;
      text += `\n🗓 Сана: **${order.date}**`;
      text += `\n⏱ Кетиш вақти: **${order.time}**`;
      text += `\n✈️ Компания: ${order.company}`;
      text += `\n✈️ Билет ID: ${order.bilet_id}`;
      text += `\n✈️ Багаж: ${order.bagaj}`;
      text += `\n💰 Тўлов: **${order.price}**\n`;
      text += `\n------------------------`;
    }
    await ctx.reply(
      `Сизнинг харидларингиз
       \n--------------------------------------------------------------` +
        text +
        ` \n--------------------------------------------------------------`
    );
  } else if (ctx.message.text === "Aдмин билан боғланиш 🙎🏻‍♂️") {
    await ctx.reply(
      `Aдмин билан боғланиш усуллари: \n\nAдмин username: @Admin \nTелефон рақам: +998 99 000 11 22`
    );
  } else {
    switch (progress) {
      case "choose_direction":
        if (!oldUser.username || !oldUser.phone) {
          oldUser.progress = "take_full_name";
          await ctx.reply(
            "Илтимос Исm ва фамилиянгизни ёзинг",
            Markup.removeKeyboard()
          );
          await oldUser.save();
        } else {
          const formatedRegions = [];
          for (let i = 0; i < regions.length; i += 3) {
            formatedRegions.push(regions.slice(i, i + 3));
          }

          oldUser.progress = `choose_region__${
            ctx.message.text == "Бориш ✈️" ? "go" : "return"
          }`;
          await oldUser.save();
          await ctx.reply(
            "Бориш учун биринчи ўринда Шаҳар танланг!",
            Markup.keyboard(formatedRegions)
          );
        }
        break;
      case "choose_region":
        const orders = await OrderModel.find({
          direction: ctx.message.text,
          is_acitve: false,
          type: progressValue,
          date: { $gte: todayStr },
        });
        let replyText = `\АРЗОН  ${
          progressValue === "go" ? "БОРИШ" : "ҚАЙТИШ"
        } БИЛЕТЛАРИ \n`;
        const buttons = [];
        const formated = [];

        if (orders.length === 0) {
          replyText += "";
        } else {
          for (let i = 0; i < orders.length; i++) {
            const order = orders[i];

            replyText += `\n${i + 1}. 🗓 Сана: ${order.date}`;
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

        if (!full_name[0] || !full_name[1] || full_name.length == 0) {
          await ctx.reply(
            "Сиз нотўғри ҳолатда ёздингиз исм фамилия ёзиш керак"
          );
        } else {
          oldUser.progress = "take_number";
          oldUser.full_name = full_name.join(" ");
          await oldUser.save();
          await ctx.reply("Илтимос телефон рақамингизни киритинг", {
            reply_markup: {
              keyboard: [
                [{ text: "📲 Телефон рақамини улашиш", request_contact: true }],
              ],
              one_time_keyboard: true,
              resize_keyboard: true,
            },
          });
        }
        break;
      default:
        break;
    }
  }
});

bot.on("contact", async (ctx) => {
  const oldUser = await findUser(ctx);
  const phoneNumber =
    ctx.message.contact.phone_number[0] === "+"
      ? ctx.message.contact.phone_number
      : "+" + ctx.message.contact.phone_number;
  const regux = /^\+998(33|55|77|88|90|91|93|94|95|97|98|99)\d{7}$/;
  console.log(phoneNumber);
  console.log(regux.test(phoneNumber));
  if (!regux.test(phoneNumber)) {
    await ctx.reply("Илтимос телефон рақам хато киритилди");
  } else {
    oldUser.phone = phoneNumber;
    oldUser.progress = "choose_direction";
    await oldUser.save();
    await ctx.reply("Сиз рўйхатдан ўтдингиз сиз нима қилмоқчисиз", {
      reply_markup: {
        keyboard: [[{ text: "Бориш ✈️" }, { text: "Қайтиш 🏡" }]],
        resize_keyboard: true,
      },
    });
  }
});

bot.action(/choose_ticket_([a-fA-F0-9]+)/, async (ctx) => {
  const id = ctx.match[0].split("_")[2];
  const order = await OrderModel.findById(id);

  if (!order) {
    await ctx.reply("Bunday bilet topilmadi !");
  } else {
    await ctx.reply(
      `
\n💰 Тўлов: ${order.price}
📆Сана: ${order.date}
🛬Кетиш вақти: ${order.time}
🛬Қуниш вақти: ${order.arrive_time || ""}
✈️ Билет ID: ${order.bilet_id}
✈️ Багаж: ${order.bagaj}
🛩 Кампания : ${order.company || ""}
🛩 Рейс : ${order.bilet_id || ""}
🍱 Иссиқ Таом 
💧 Замзам
`,
      Markup.inlineKeyboard([
        [Markup.button.callback("Сотиб олиш", "buy_ticket_" + order._id)],
      ])
    );
  }
});

bot.action("group", async (ctx) => {
  const groupIds = await GroupIdModel.find({});
  console.log("salom");
  for (let i = 0; i < groupIds.length; i++) {
    const groupId = groupIds[i];

    await ctx.telegram.sendMessage(groupId.groupId, "Yangi odam qo`shildi");
  }
});

bot.action(/buy_ticket_([a-fA-F0-9]+)/, async (ctx) => {
  const oldUser = await findUser(ctx);
  const ticketId = ctx.match[0].split("_")[2];
  const order = await OrderModel.findById(ticketId);
  order.clients.push({ userId: oldUser._id });
  oldUser.progress = "choose_direction";
  await oldUser.save();
  await order.save();
  for (let i = 0; i < adminIds.length; i++) {
    const groupId = adminIds[i];

    await ctx.telegram.sendMessage(
      groupId.groupId,
      `Yangi odam bilet sotib oldi:
       \nusername:${oldUser.username}
       \nphone: ${oldUser.phone}
       \nbilet nomi:${order.direction} to ${order.direction_to}
       \nkampaniya: ${order.company}
      `
    );
  }
  await ctx.reply(
    "Сиз битта билет олдингиз \n\nАДМИН билан боғланинг, у сизга ҳамма нарсани тушунтиради АДМИН: @trello_one_bot",
    {
      reply_markup: {
        keyboard: [
          [
            { text: "Бориш ✈️" },
            { text: "Қайтиш 🏡" },
            { text: "Билетларим 🎟" },
            { text: "Aдмин билан боғланиш 🙎🏻‍♂️" },
          ],
        ],
        resize_keyboard: true,
      },
    }
  );
});

module.exports = bot;
