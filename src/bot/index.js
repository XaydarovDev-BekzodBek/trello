const { Telegraf } = require("telegraf");
const Markup = require("telegraf/markup");
const { BOT_TOKEN } = require("../constants/.envirment");
const { BotClientModel, OrderModel, GroupIdModel } = require("../models");

const regions = [
  "Тошкент вилояти",
  "Наманган",
  "Андижон",
  "Фарғона",
  "Жиззах",
  "Хоразм",
  "Навоий",
  "Қашқадарё",
  "Самарқанд",
  "Сирдарё",
  "Термиз",
  "Бухоро",
];

console.log("bot.js is running");

const adminIds = ["-5007246078"];

const bot = new Telegraf(BOT_TOKEN);
const deleteChatIds = new Map();
const users = new Map();

const findUser = async (ctx) => {
  const updateData = {
    username: ctx.chat.username || "username yo`q akaunt",
  };

  const user = await BotClientModel.findOneAndUpdate(
    { chat_id: ctx.chat.id },
    { $set: updateData },
    {
      new: true,
      upsert: true,
    }
  );

  return user;
};

const formatSingleOrder = (order, index) => {
  return `
*${index + 1}.📆Сана: ${order.date}
🛫Кетиш вақти: ${order.time}
🛬Қуниш вақти: ${order.arrive_time}
✈️ Билет ID: ${order.bilet_id}
🛩️ Кампания: ${order.company} 
🧳Багаж: ${order.bagaj} 
🍱 Иссиқ Таом 
💧 Замзам
💰 Нархи : ${order.price}$
---`;
};

const sendTodayTicketsNotification = async (date, tickets) => {
  let fullMessage;

  if (tickets.length === 0) {
    fullMessage = `
*--- 🗓️ ${date} Sanasidagi Biletlar Ro'yxati ---*
*Bugun jo'natiladigan biletlar topilmadi!*
`;
  } else {
    const header = `
*--- 🗓️ ${date} Sanasidagi Biletlar Ro'yxati (${tickets.length} ta) ---*
`;
    const ticketsMessage = tickets
      .map((ticket, index) => formatSingleOrder(ticket, index))
      .join("\n");

    fullMessage = header + ticketsMessage;
  }

  await sendToAllChats(fullMessage);
  return true;
};

const sendToAllChats = async (text) => {
  const groups = await GroupIdModel.find({});
  for (const chatId of groups) {
    try {
      await bot.telegram.sendMessage(chatId.groupId, text, {
        parse_mode: "Markdown",
      });
      console.log(`Telegram xabari yuborildi: ${chatId}`);
    } catch (error) {
      console.error(
        `Telegram xabari yuborishda xato (${chatId}):`,
        error.message
      );
    }
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
    `Ассалому алайкум! 
"Арабистонга Билетлар" ботига хуш келибсиз!

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

// bot.command("group", async (ctx) => {
//   if (ctx.chat.type === "group") {
//     const chatId = ctx.chat.id;
//     const oldGroup = await GroupIdModel.findOne({ groupId: chatId });
//     if (oldGroup) {
//       await ctx.reply("bot bu gurupada bor");
//     } else {
//       await GroupIdModel.create({ groupId: chatId });
//       await ctx.reply("Bot bu gurupada ishga tushdi");
//     }
//   }
// });

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
      text += `
📆Сана: ${order.date}
🛫Кетиш вақти: ${order.time}
🛬Қуниш вақти: ${order.arrive_time}
✈️ Билет ID: ${order.bilet_id}
🛩️ Кампания: ${order.company} 
🧳Багаж: ${order.bagaj} 
🍱 Иссиқ Таом 
💧 Замзам
💰 Нархи : ${order.price}$
      `;
    }
    await ctx.reply(
      `Сизнинг харидларингиз
       \n--------------------------------------------------------------` +
        text +
        ` \n--------------------------------------------------------------`
    );
  } else if (ctx.message.text === "Aдмин билан боғланиш 🙎🏻‍♂️") {
    await ctx.reply(
      `Aдмин билан боғланиш усуллари: \n\nAдмин username: @Arzonbiletch1 \nTелефон рақам: +998912754444`
    );
  } else {
    switch (progress) {
      case "choose_direction":
        if (!oldUser.username || !oldUser.phone) {
          oldUser.progress = "take_phone";
          await ctx.reply("Илтимос телефон рақамингизни киритинг", {
            reply_markup: {
              keyboard: [
                [{ text: "📲 Телефон рақамини улашиш", request_contact: true }],
              ],
              one_time_keyboard: true,
              resize_keyboard: true,
            },
          });
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
            ctx.message.text == "Бориш ✈️"
              ? "Бориш учун биринчи ўринда Шаҳар танланг!"
              : "Қайтмоқчи бўлган шаҳарни танланг!",
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
          await ctx.reply(
            "Ҳозирча бу шаҳарга жойлар қолмаган, ўзингизга яқинроқ шаҳарни танланг"
          );
        } else {
          for (let i = 0; i < orders.length; i++) {
            const order = orders[i];

            replyText += `\n${i + 1}. 🗓 Сана: ${order.date}`;
            buttons.push(
              Markup.button.callback(i + 1, `choose_ticket_${order._id}`)
            );
          }

          for (let i = 0; i < buttons.length; i += 4) {
            formated.push(buttons.slice(i, i + 4));
          }

          await ctx.reply(replyText, Markup.inlineKeyboard(formated));
        }
        break;
        // case "take_full_name":
        //   const full_name = ctx.message.text.split(" ");

        //   if (!full_name[0] || !full_name[1] || full_name.length == 0) {
        //     await ctx.reply(
        //       "Сиз нотўғри ҳолатда ёздингиз исм фамилия ёзиш керак"
        //     );
        //   } else {
        //     oldUser.progress = "take_number";
        //     oldUser.full_name = full_name.join(" ");
        //     await oldUser.save();
        //     await ctx.reply("Илтимос телефон рақамингизни киритинг", {
        //       reply_markup: {
        //         keyboard: [
        //           [{ text: "📲 Телефон рақамини улашиш", request_contact: true }],
        //         ],
        //         one_time_keyboard: true,
        //         resize_keyboard: true,
        //       },
        //     });
        //   }
        //   break;
        // default:
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
📆Сана: ${order.date}
🛫Кетиш вақти: ${order.time}
🛬Қуниш вақти: ${order.arrive_time}
✈️ Билет ID: ${order.bilet_id}
🛩️ Кампания: ${order.company} 
🧳Багаж: ${order.bagaj} 
🍱 Иссиқ Таом 
💧 Замзам

💰 Нархи : ${order.price}$
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
  try {
    const oldUser = await findUser(ctx);
    const ticketId = ctx.match[0].split("_")[2];
    const order = await OrderModel.findById(ticketId);

    order.clients.push({ userId: oldUser._id });
    oldUser.progress = "choose_direction";
    await oldUser.save();
    await order.save();

    for (let i = 0; i < adminIds.length; i++) {
      const groupId = adminIds[i];

      try {
        await ctx.telegram.sendMessage(
          groupId,
          `Yangi odam bilet sotib oldi:
               \nusername:@${oldUser.username}
               \nphone: ${oldUser.phone}
               \nbilet nomi:${order.direction} to ${order.direction_to}
               \nkampaniya: ${order.company}
               \bilet id: ${order.bilet_id}
              `
        );
      } catch (adminError) {
        console.error(`Failed to notify admin ${groupId}:`, adminError.message);
      }
    }

    await ctx.reply(
      "Сиз битта билет олдингиз \n\nАДМИН билан боғланинг, у сизга ҳамма нарсани тушунтиради АДМИН: @Arzonbiletch1",
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

    await ctx.answerCbQuery();
  } catch (error) {
    if (error.code === 400 && error.message.includes("chat not found")) {
      console.warn(
        `[Buy Ticket] User ${ctx.from.id} blocked the bot after clicking. Database update successful, skipping reply.`
      );
    } else {
      console.error("[Buy Ticket] An unexpected error occurred:", error);
    }
  }
});

module.exports = { bot, sendTodayTicketsNotification };
