const Joi = require("joi");

const OrderCreateValidation = Joi.object({
  direction: Joi.string().required(),
  direction_to: Joi.string().required(),
  bagaj: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string(),
  price: Joi.string().required(),
  buyed_ticket: Joi.number().required(),
  type: Joi.string().required(),
  arrive_time: Joi.string().required(),
  company: Joi.string().required(),
  bilet_id: Joi.string().required(),
});

const OrderUpdateValidation = Joi.object({
  direction: Joi.string().required(),
  direction_to: Joi.string().required(),
  bagaj: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string(),
  price: Joi.string().required(),
  buyed_ticket: Joi.number().required(),
  type: Joi.string().required(),
  arrive_time: Joi.string().required(),
  company: Joi.string().required(),
  bilet_id: Joi.string().required(),
});

const AddPeopleOrderValidation = Joi.object({
  people: Joi.number().required(),
});

module.exports = {
  OrderCreateValidation,
  OrderUpdateValidation,
  AddPeopleOrderValidation,
};
