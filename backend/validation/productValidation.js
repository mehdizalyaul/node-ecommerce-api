const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(50).required(),
  description: Joi.string().required(),
  price: Joi.number().greater(0).required(),
  stock: Joi.number().greater(0).required(),
  categoryId: Joi.number().required(),
  images: Joi.array().items(Joi.string().uri()).optional(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(50).optional(),
  description: Joi.string().optional(),
  price: Joi.number().greater(0).optional(),
  stock: Joi.number().greater(0).optional(),
  categoryId: Joi.number().optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
});

module.exports = { createProductSchema, updateProductSchema };
