const Joi = require("joi");

const createOrder = Joi.object({
  address: Joi.string().alphanum().min(3).max(100).required(),
  paymentMethod: Joi.string().required(),
});

module.exports = { createOrder };
