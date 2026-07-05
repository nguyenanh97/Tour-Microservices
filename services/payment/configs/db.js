import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool;
const connectDB = async () => {
  try {
    if (pool) return pool;
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('MySQL Connected! Test query result:', rows[0].result);
    return pool;
  } catch (err) {
    console.error('Error connecting MySQL:', err);
    throw err;
  }
};
export default connectDB;
