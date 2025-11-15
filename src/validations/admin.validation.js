const Joi = require("joi");

const AdminLoginSchema = Joi.object({
  login: Joi.string().required(),
  password: Joi.string().required(),
});

const AdminRegisterSchema = Joi.object({
  login: Joi.string().required(),
  password: Joi.string().required(),
});

const AdminUpdateSchema = Joi.object({
  login: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = { AdminLoginSchema, AdminRegisterSchema, AdminUpdateSchema };
