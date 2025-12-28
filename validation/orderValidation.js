const Joi = require("joi");

const createOrderSchema = Joi.object({
  address: Joi.string().min(3).max(100).required(),
  paymentMethod: Joi.string().required(),
});

module.exports = { createOrderSchema };
