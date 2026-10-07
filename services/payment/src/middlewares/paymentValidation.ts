import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import AppError from '../utils/appError';
const paymentCreateSchema = Joi.object({
  bookingId: Joi.alternatives()
    .try(Joi.string(), Joi.number().positive())
    .required()
    .messages({ 'any.required': 'The Booking ID is mandatory.' }),
  amount: Joi.number().positive().required().messages({
    'number.base': 'The amount must be a number.',
    'number.positive': 'The payment amount must be greater than 0.',
    'any.required': 'The payment amount is required.',
  }),
  currency: Joi.string().trim().uppercase().length(3).default('USD').optional(),
  customerEmail: Joi.string().trim().email().required().messages({
    'string.email': 'Customer email is in an invalid format.',
    'any.required': 'Customer email is required.',
  }),
  provider: Joi.string()
    .valid('stripe', 'paypal', 'vnpay', 'momo')
    .default('stripe')
    .optional(),
  sessionId: Joi.string().trim().allow(null, '').optional(),
  meta: Joi.object().optional(),
});
