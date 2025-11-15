const Joi = require("joi");

const OrderCreateValidation = Joi.object({
  direction: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string(),
  price: Joi.string().required(),
  limit_of_clients: Joi.number().required(),
});

const OrderUpdateValidation = Joi.object({
  direction: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string(),
  price: Joi.string().required(),
  limit_of_clients: Joi.number().required(),
});

module.exports = { OrderCreateValidation, OrderUpdateValidation };
