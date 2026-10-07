import { Request, Response, NextFunction } from 'express';
import z from 'joi';
import AppError from '../utils/appError';

const userUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional().messages({
      'string.min': 'Name must be at least 2 characters long.',
      'string.max': 'Name cannot exceed 100 characters.',
    }),
    age: z.number().integer().min(1).max(500).optional().messages({
      'number.base': 'Age must be a number.',
      'number.min': 'Age must be at least 1.',
      'number.max': 'Age cannot exceed 120.',
    }),
    avatar: z.string().trim().max(500).allow('', null).optional(),
    phone: z
      .string()
      .trim()
      .pattern(/^[0-9+-\s]{8,20}$/)
      .allow('', null)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number (8-20 digits).',
      }),
    address: z.string().trim().max(255).allow('', null).optional(),
    bio: z.string().trim().max(1000).allow('', null).optional(),
  })
  .min(1)
  .messages({
    'object.min': 'Please provide at least one field to update your profile.',
  });

const userCreateSchema = z.object({
  userId: z
    .string()
    .trim()
    .required()
    .messages({ 'any.required': 'User ID is required for profile creation.' }),
  name: z.string().trim().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters long.',
    'string.max': 'Name cannot exceed 100 characters.',
    'any.required': 'Name is required.',
  }),
  age: z.number().integer().min(1).max(100).optional().messages({
    'number.base': 'Age must be a number.',
    'number.min': 'Age must be at least 1.',
    'number.max': 'Age cannot exceed 120.',
  }),
  avatar: z.string().trim().max(500).allow('', null).optional(),
  phone: z
    .string()
    .trim()
    .pattern(/^[0-9+-\s]{8,20}$/)
    .allow('', null)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number (8-20 digits).',
    }),
  addreess: z.string().trim().max(255).allow('', null).optional(),
  bio: z.string().trim().max(1000).allow('', null).optional(),
});

//Validate Create

export const validateUserCreateProfile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error, value } = userCreateSchema.validate(req.body, {
    stripUnknown: true,
    abortEarly: false,
  });
  if (error) {
    const errorMsg = error.details.map(d => d.message).join(', ');
    return next(new AppError(errorMsg, 400));
  }
  req.body = value;
  next();
};

//Validate Update
export const validateUserProfileUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error, value } = userUpdateSchema.validate(req.body, {
    stripUnknown: true,
    abortEarly: false,
  });
  if (error) {
    const errorMsg = error.details.map(d => d.message).join(', ');
    return next(new AppError(errorMsg, 400));
  }
  req.body = value;

  next();
};

//Validate Status (Admin)
