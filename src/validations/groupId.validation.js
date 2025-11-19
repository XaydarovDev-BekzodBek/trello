const Joi = require("joi");

const GroupIdCreateSchema = Joi.object({
  groupId: Joi.string().required(),
});

const GroupIdUpdateSchema = Joi.object({
  groupId: Joi.string().required(),
});

module.exports = { GroupIdCreateSchema, GroupIdUpdateSchema };
