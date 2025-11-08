import { expect, jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import connectDB from '../config/db.js';
import mongoose from 'mongoose';
import notificationQueue from '../jobs/email.js';

// Mock notification queue to avoid calling Redis during tests
jest.spyOn(notificationQueue, 'add').mockImplementation(async () => {
  return { id: 'mock-job-id' };
});

beforeAll(async () => {
  await connectDB();
  console.log('Test started');
});

// Clean DB between tests to keep tests isolated
beforeEach(async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const name of collections) {
    try {
      await mongoose.connection.collections[name].deleteMany({});
    } catch (err) {
      console.error(`Error cleaning collection ${name}:`, err);
    }
  }
});

//
afterAll(async () => {
  // Close mongoose connection
  try {
    await mongoose.connection.close();
  } catch (e) {
    // ignore
  }

  // Close Bull/queue connection if available
  if (notificationQueue && typeof notificationQueue.close === 'function') {
    try {
      await notificationQueue.close();
    } catch (e) {
      // ignore
    }
  }
});

describe('Auth API', () => {
  //  SIGNUP && LOGIN (OK)
  // it('đăng kí tài khoản mới', async () => {
  //   const res = await request(app).post('/api/v1/auth/signup').send({
  //     email: 'test@example.com',
  //     password: 'password123',
  //     passwordConfirm: 'password123',
  //     name: 'Test User',
  //   });
  //   expect(res.statusCode).toBe(201);
  //   expect(res.body).toHaveProperty('accessToken');
  //   expect(res.body.data).toHaveProperty('user');
  // }, 15000);
  // it('dang nhap', async () => {
  //   // Đăng ký user trước
  //   await request(app).post('/api/v1/auth/signup').send({
  //     email: 'test@example.com',
  //     password: 'password123',
  //     passwordConfirm: 'password123',
  //     name: 'Test User',
  //   });
  //   // Login
  //   const res = await request(app).post('/api/v1/auth/login').send({
  //     email: 'test@example.com',
  //     password: 'password123',
  //   });
  //   expect(res.statusCode).toBe(201);
  //   expect(res.body).toHaveProperty('accessToken');
  // }, 15000);

  // FORGOT PASSWORD

  // 1:(xử lý gửi token về email)
  it('forgot password && send email token', async () => {
    // Đăng ký user trước
    await request(app).post('/api/v1/auth/signup').send({
      email: 'forgotten@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      name: 'Forgotten User',
    });
    //gọi forgot password
    const res = await request(app).post('/api/v1/auth/forgotPassword').send({
      email: 'forgotten@example.com',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Token sent to email!/i);
  }, 15000);

  // 2: xử lý đổi mk mới
  it('reset password thanh cong', async () => {
    // dktk mới
    const signupRes = await request(app).post('/api/v1/auth/signup').send({
      email: 'reset@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      name: 'Reset user',
    });
    // forget để lấy token
    const forgotRes = await request(app).post('/api/v1/auth/forgotPassword').send({
      email: 'reset@example.com',
    });
    console.log('Forgot Response:', forgotRes.body);
    const token = forgotRes.body.testToken;
    console.log('Reset Token:', token);
    // Gọi resetPassword
    const res = await request(app)
      .patch(`/api/v1/auth/resetPassword/${token}`)
      .send({
        password: 'newpassword123',
        passwordConfirm: 'newpassword123',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  }, 20000);

  // VERIFY EMAIL
  it('verify email thanh cong', async () => {
    // dk tk
    const signupRes = await request(app).post('/api/v1/auth/signup').send({
      email: 'verify@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      name: 'Verify User',
    });

    // Lấy token xác thực từ DB (gốc)

    const token = signupRes.body.testToken;

    // goi verifyEmail
    const res = await request(app).get(`/api/v1/auth/verifyEmail/${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  }, 15000);

  it('uppdate password thanh cong', async () => {
    // a. Đăng ký user trước
    const signupRes = await request(app).post('/api/v1/auth/signup').send({
      email: 'update@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      name: 'Update User',
    });

    //b verify email
    const verifyToken = signupRes.body.testToken;
    await request(app).get(`/api/v1/auth/verifyEmail/${verifyToken}`);

    // c. Login để lấy Token
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'update@example.com',
      password: 'password123',
    });
    const token = loginRes.body.accessToken;
    console.log('Login Token:', token); // debug
    // d. Gọi updatePassword
    const res = await request(app)
      .patch('/api/v1/auth/updatePassword')
      .set('Authorization', `Bearer ${token}`)
      .send({
        passwordCurrent: 'password123',
        password: 'Newpassword123!',
        passwordConfirm: 'Newpassword123!',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  }, 15000);
});
