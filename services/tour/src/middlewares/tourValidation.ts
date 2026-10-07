import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

const distanceSchema = Joi.object({
  distance: Joi.number().positive().required().messages({
    'number.base': 'Distance must be a number.',
    'number.positive': 'Distance must be a positive number.',
    'any.required': 'Distance is required.',
  }),
  latlng: Joi.string()
    .pattern(/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/)
    .required()
    .messages({
      'string.pattern.base':
        'Invalid latitude and longitude. Format must be "lat,lng".',
      'any.required': 'Latitude and longitude are required.',
    }),
  unit: Joi.string().valid('mi', 'km').required().messages({
    'any.only': 'Units must be "mi" (miles) or "km" (kilometers).',
    'any.required': 'Unit is required.',
  }),
});

const tourCreateSchema = Joi.object({
  name: Joi.string().min(5).max(100).required().messages({
    'string.empty': 'Tour name cannot be empty',
    'string.min': 'Tour name must be at least 5 characters long',
    'string.max': 'Tour name cannot exceed 100 characters',
    'any.required': 'Tour name is required',
  }),
  duration: Joi.number().positive().integer().required().messages({
    'number.base': 'Duration must be a number',
    'number.positive': 'Duration must be positive',
    'any.required': 'Duration is required',
  }),
  maxGroupSize: Joi.number().positive().integer().required().messages({
    'number.base': 'Max group size must be a number',
    'number.positive': 'Max group size must be positive',
    'any.required': 'Max group size is required',
  }),
  difficulty: Joi.string().valid('easy', 'medium', 'difficult').required().messages({
    'any.only': 'Difficulty must be easy, medium, or difficult',
    'any.required': 'Difficulty is required',
  }),
  price: Joi.number().positive().required().messages({
    'number.base': 'Price must be a number',
    'number.positive': 'Price must be positive',
    'any.required': 'Price is required',
  }),
  priceDiscount: Joi.number()
    .positive()
    .custom((value, helpers) => {
      const parent = helpers.state.ancestors[0];
      if (parent.price !== undefined && value >= parent.price) {
        return helpers.error('any.custom');
      }
      return value;
    })
    .messages({
      'any.custom': 'Discount price must be less than regular price',
    }),
  summary: Joi.string().required().messages({
    'any.required': 'Summary is required',
  }),
  description: Joi.string().allow(''),
  imageCover: Joi.string().required().messages({
    'any.required': 'Image cover is required',
  }),
  images: Joi.array().items(Joi.string()),
  startDates: Joi.array().items(Joi.date()),
  startLocation: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
    address: Joi.string(),
    description: Joi.string(),
  }),
  locations: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
      address: Joi.string(),
      description: Joi.string(),
      day: Joi.number().integer().min(1),
    })
  ),
  isPublished: Joi.boolean().default(false),
  guides: Joi.array().items(Joi.number()),
});

const tourUpdateSchema = Joi.object({
  name: Joi.string().min(5).max(100),
  duration: Joi.number().positive().integer(),
  maxGroupSize: Joi.number().positive().integer(),
  difficulty: Joi.string().valid('easy', 'medium', 'difficult'),
  price: Joi.number().positive(),
  priceDiscount: Joi.number()
    .positive()
    .custom((value, helpers) => {
      const parent = helpers.state.ancestors[0];
      if (parent.price !== undefined && value >= parent.price) {
        return helpers.error('any.custom');
      }
      return value;
    })
    .messages({
      'any.custom': 'Discount price must be less than regular price',
    }),
  summary: Joi.string(),
  description: Joi.string().allow(''),
  imageCover: Joi.string(),
  images: Joi.array().items(Joi.string()),
  startDates: Joi.array().items(Joi.date()),
  startLocation: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
    address: Joi.string(),
    description: Joi.string(),
  }),
  locations: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
      address: Joi.string(),
      description: Joi.string(),
    })
  ),
  isPublished: Joi.boolean(),
  guides: Joi.array().items(Joi.number()),
});

export const validateDistanceParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = distanceSchema.validate(req.params);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }
  next();
};

export const validateTourCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = tourCreateSchema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }
  next();
};

export const validateTourUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = tourUpdateSchema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }
  next();
};
