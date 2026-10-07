import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } = process.env;

if (!DB_NAME || !DB_USER || !DB_PASSWORD || !DB_HOST) {
  throw new Error('Database environment variables are missing!');
}
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
