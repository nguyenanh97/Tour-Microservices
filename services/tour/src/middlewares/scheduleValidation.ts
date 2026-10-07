import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

// Create Schedule
const scheduleCreateSchema = Joi.object({
  startDate: Joi.date().required().messages({
    'date.base': 'Start date must be a valid date.',
    'any.required': 'Start date is required.',
  }),
  price: Joi.number().positive().required().messages({
    'number.base': 'Price must be a number.',
    'number.positive': 'Price must be positive.',
    'any.required': 'Price is required.',
  }),
  maxGroupSize: Joi.number().positive().integer().required().messages({
    'number.base': 'Max group size must be a number.',
    'number.positive': 'Max group size must be positive.',
    'any.required': 'Max group size is required.',
  }),
  status: Joi.string().valid('active', 'full', 'cancelled').default('active'),
  bookedSeats: Joi.number().min(0).default(0),
});

// Update Schedule
const scheduleUpdateSchema = Joi.object({
  startDate: Joi.date(),
  price: Joi.number().positive(),
  maxGroupSize: Joi.number().positive().integer(),
  status: Joi.string().valid('active', 'full', 'cancelled'),
  bookedSeats: Joi.number().min(0),
});

// BookedSeats Schedule
const scheduleBookedSeatsSchema = Joi.object({
  numberOfGuests: Joi.number().integer().invalid(0).required().messages({
    'number.base': 'numberOfGuests must be a valid number.',
    'number.integer': 'numberOfGuests must be an integer.',
    'any.invalid': 'numberOfGuests cannot be 0.',
    'any.required': 'numberOfGuests is required.',
  }),
});

export const validateScheduleCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = scheduleCreateSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }
  next();
};
export const validateScheduleUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = scheduleUpdateSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }
  next();
};

export const validateBookedSeats = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = scheduleBookedSeatsSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }
  next();
};
