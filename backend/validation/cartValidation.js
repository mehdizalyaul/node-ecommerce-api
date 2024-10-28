const Joi = require("joi");

const createCartSchema = Joi.object({
  productId: Joi.number().required(),
  quantity: Joi.number().greater(0).required(),
  description: Joi.string().required(),
});

const updateCartSchema = Joi.object({
  productId: Joi.number().optional(),
  quantity: Joi.number().greater(0).optional(),
  description: Joi.string().optional(),
});

module.exports = { createCartSchema, updateCartSchema };
