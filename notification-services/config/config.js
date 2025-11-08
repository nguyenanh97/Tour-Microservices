import dotenv from 'dotenv';
dotenv.config();
import Joi from 'joi';
const emailFromValidator = (value, helpers) => {
  const pureEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const displayFormRegex = /^.+<\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*>$/;
  if (pureEmailRegex.test(value) || displayFormRegex.test(value)) return value;
  return helpers.error('any.invalid');
};
const schema = Joi.object({
  PORT: Joi.number().default(4000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  SERVICE_NAME: Joi.string().default('notification-service'),

  //redis
  REDIS_URL: Joi.string().uri().optional(),
  REDIS_HOST: Joi.string().default('redis'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional(),

  // Email
  EMAIL_HOST: Joi.string().default('mailhog'),
  EMAIL_PORT: Joi.number().default(1025),
  EMAIL_USERNAME: Joi.string().allow('').default(''),
  EMAIL_PASSWORD: Joi.string().allow('').default(''),
  EMAIL_FROM_NAME: Joi.string().default('YourApp Dev'),
  EMAIL_FROM_ADDRESS: Joi.string().email().default('no-reply@yourapp.dev'),
  EMAIL_SECURE: Joi.string().valid('true', 'false').default('false'),

  //FCM
  FCM_SERVER_KEY: Joi.string().optional(),
  LOG_LEVEL: Joi.string().default('info'),
}).unknown();
const { error, value: env } = schema.validate(process.env, { abortEarly: false });
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  env: env.NODE_ENV,
  serviceName: env.SERVICE_NAME,

  redis: {
    url: env.REDIS_URL || null,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },

  email: {
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    user: env.EMAIL_USERNAME,
    pass: env.EMAIL_PASSWORD,
    secure: env.EMAIL_SECURE,
    from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM_ADDRESS}>`,
    rawFromAddress: env.EMAIL_FROM_ADDRESS,
  },

  fcm: {
    serverKey: env.FCM_SERVER_KEY || null,
  },

  logLevel: env.LOG_LEVEL,
};
