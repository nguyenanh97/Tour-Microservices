import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import AppError from '../utils/appError';
const bookingCreateSchema = Joi.object({
  tourId: Joi.number().integer().positive().required(),
  tourScheduleId: Joi.number().integer().positive().required(),
  numberOfGuests: Joi.alternatives()
    .try(
      Joi.number().integer().min(1).strict(),
      Joi.string()
        .pattern(/^[1-9]\d*$/)
        .messages({
          'string.pattern.base':
            'The number of guests must be a positive integer (without decimal points).',
        }),
    )
    .required(),
  customerName: Joi.string().trim().required(),
  customerEmail: Joi.string().trim().email().required(),
  customerPhone: Joi.string()
    .regex(/^[0-9+-\s]{8,20}$/, 'Invalid phone number')
    .optional(),
});

const bookingUpdateSchema = Joi.object({
  customerName: Joi.string().trim().optional(),
  customerEmail: Joi.string().trim().email().optional(),
  customerPhone: Joi.string()
    .regex(/^[0-9+-\s]{8,20}$/, 'Invalid phone number')
    .optional(),
  numberOfGuests: Joi.alternatives()
    .try(
      Joi.number().integer().min(1).strict(),
      Joi.string()
        .pattern(/^[1-9]\d*$/)
        .messages({
          'string.pattern.base':
            'The number of guests must be a positive integer (without decimal points).',
        }),
    )
    .optional(),
}).min(1);

const bookingStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'cancelled', 'refunded')
    .optional()
    .messages({
      'any.only':
        'The paymentStatus field can only take one of the following values: pending, paid, failed, or refunded.',
    }),
  paymentStatus: Joi.string()
    .valid('pending', 'paid', 'failed', 'refunded')
    .optional()
    .messages({
      'any.only':
        'The paymentStatus field can only take one of the following values: pending, paid, failed, or refunded.',
    }),
  paymentIntentId: Joi.string().allow('', null).optional().messages({
    'object.min':
      'Please provide at least one field to update (status, paymentStatus, paymentIntentId).',
  }),
});

//Validate Create
export const validateBookingCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = bookingCreateSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    const errorMsg = error.details.map(d => d.message).join(', ');

    return next(new AppError(errorMsg, 400));
  }
  next();
};

//Validate Update
export const validateBookingUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = bookingUpdateSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    const errorMsg = error.details.map(d => d.message).join(', ');
    return next(new AppError(errorMsg, 400));
  }
  next();
};

//Validate Status (Admin)

export const validateBookingStatus = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = bookingStatusSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    const errorMsg = error.details.map(d => d.message).join(', ');
    return next(new AppError(errorMsg, 400));
  }
  next();
};
