// import request from 'supertest';
// import app from '../app.js';
// // import connectDB from '../config/db.js';
// import mongoose from 'mongoose';
// import path from 'path';
// import fs from 'fs';
// import jwt from 'jsonwebtoken';

// const privateKey = fs.readFileSync(
//   path.join(process.cwd(), 'config/jwtRS256.key'),
//   'utf-8'
// );
// const publicKey = fs.readFileSync(
//   path.join(process.cwd(), 'config/jwtRS256.key.pub'),
//   'utf-8'
// );
// function generateToken(
//   payload = {
//     id: '60d21b4667d0d8992e610c85',
//     role: 'admin',
//     email: 'test@example.com',
//   }
// ) {
//   return jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1h' });
// }

// beforeAll(async () => {
//   // Đảm bảo biến môi trường DB_URI_TEST đã được thiết lập trong file .env.test
//   const dbUri = process.env.MONGO_URI;
//   if (!dbUri) {
//     throw new Error('DB_URI_TEST is not defined in your .env.test file');
//   }
//   await mongoose.connect(dbUri);
// });

// // clean DB
// beforeEach(async () => {
//   const collections = Object.keys(mongoose.connection.collections);
//   for (const name of collections) {
//     try {
//       await mongoose.connection.collections[name].deleteMany({});
//     } catch (err) {
//       console.error(`Error cleaning collection ${name}:`, err);
//     }
//   }
// });

// describe('Tour API (protected)', () => {
//   let token;
//   let createdId;
//   beforeEach(() => {
//     token = generateToken();
//   });
//   // ADMIN
//   // it('admin cập nhật tour id không tồn tại', async () => {
//   //   const adminToken = generateToken({
//   //     id: '60d21b4667d0d8992e610c82',
//   //     role: 'admin',
//   //     email: 'test@example.com',
//   //   });
//   //   const res = await request(app)
//   //     .delete('/api/v1/tours/6123456789abcdef01234567')
//   //     .set('Authorization', `Bearer ${adminToken}`)
//   //     .send({
//   //       name: 'Should not update',
//   //     });
//   //   expect(res.statusCode).toBe(404);
//   // });

//   // TEST CÁC TÍNH NĂNG KHÁC
//   // TOUR ID
//   // it('lấy Tour ID', async () => {
//   //   const resCreate = await request(app)
//   //     .post('/api/v1/tours')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send({
//   //       name: 'Test Tour 03',
//   //       price: 300,
//   //       duration: 10,
//   //       difficulty: 'medium',
//   //       maxGroupSize: 20,
//   //       summary: 'Third test tour',
//   //       description: 'Test description 3',
//   //       imageCover: 'cover3.jpg',
//   //       startLocation: {
//   //         type: 'Point',
//   //         coordinates: [107, 22],
//   //         description: 'Hà Nội, Việt Nam',
//   //         address: 'Hà Nội',
//   //       },
//   //     });
//   //   const id = resCreate.body.data.doc._id;

//   //   const res = await request(app)
//   //     .get(`/api/v1/tours/${id}`)
//   //     .set('Authorization', `Bearer ${token}`);

//   //   expect(res.statusCode).toBe(200);
//   //   expect(res.body.data.doc.name).toBe('Test Tour 03');
//   // });

//   // it('cập nhật tour', async () => {
//   //   const resCreate = await request(app)
//   //     .post('/api/v1/tours')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send({
//   //       name: 'Test Tour 03',
//   //       price: 300,
//   //       duration: 10,
//   //       difficulty: 'medium',
//   //       maxGroupSize: 20,
//   //       summary: 'Third test tour',
//   //       description: 'Test description 3',
//   //       imageCover: 'cover3.jpg',
//   //       startLocation: {
//   //         type: 'Point',
//   //         coordinates: [107, 22],
//   //         description: 'Hà Nội, Việt Nam',
//   //         address: 'Hà Nội',
//   //       },
//   //     });
//   //   const id = resCreate.body.data.doc._id;

//   //   const res = await request(app)
//   //     .patch(`/api/v1/tours/${id}`)
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send({
//   //       name: 'Updated Test Tour 03',
//   //     });
//   //   expect(res.statusCode).toBe(200);
//   //   expect(res.body.data.doc.name).toBe('Updated Test Tour 03');
//   // });

//   // it('xoa tour ID', async () => {
//   //   const resCreate = await request(app)
//   //     .post('/api/v1/tours')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send({
//   //       name: 'Test Tour 0134',
//   //       price: 300,
//   //       duration: 10,
//   //       difficulty: 'medium',
//   //       maxGroupSize: 20,
//   //       summary: 'Third test tour',
//   //       description: 'Test description 3',
//   //       imageCover: 'cover3.jpg',
//   //       startLocation: {
//   //         type: 'Point',
//   //         coordinates: [107, 22],
//   //         description: 'Hà Nội, Việt Nam',
//   //         address: 'Hà Nội',
//   //       },
//   //     });
//   //   const id = resCreate.body.data.doc._id;
//   //   const res = await request(app)
//   //     .delete(`/api/v1/tours/${id}`)
//   //     .set('Authorization', `Bearer ${token}`);

//   //   expect(res.statusCode).toBe(204);
//   // });

//   //  TEST CÁC TÍNH NẰNG LỌC TRA
//   // it('GET /api/v1/tours?limit=2 - trả về đúng số lượng tour', async () => {
//   //   // Tạo nhiều tour
//   //   await request(app)
//   //     .post('/api/v1/tours')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send({
//   //       name: 'Tour 1',
//   //       price: 100,
//   //       duration: 1,
//   //       difficulty: 'easy',
//   //       maxGroupSize: 5,
//   //       summary: 's',
//   //       description: 'd',
//   //       imageCover: 'a.jpg',
//   //       startLocation: {
//   //         type: 'Point',
//   //         coordinates: [0, 0],
//   //         description: '',
//   //         address: '',
//   //       },
//   //     });
//   //   await request(app)
//   //     .post('/api/v1/tours')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send({
//   //       name: 'Tour 2',
//   //       price: 200,
//   //       duration: 2,
//   //       difficulty: 'easy',
//   //       maxGroupSize: 5,
//   //       summary: 's',
//   //       description: 'd',
//   //       imageCover: 'a.jpg',
//   //       startLocation: {
//   //         type: 'Point',
//   //         coordinates: [0, 0],
//   //         description: '',
//   //         address: '',
//   //       },
//   //     });
//   //   await request(app)
//   //     .post('/api/v1/tours')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send({
//   //       name: 'Tour 3',
//   //       price: 300,
//   //       duration: 3,
//   //       difficulty: 'easy',
//   //       maxGroupSize: 5,
//   //       summary: 's',
//   //       description: 'd',
//   //       imageCover: 'a.jpg',
//   //       startLocation: {
//   //         type: 'Point',
//   //         coordinates: [0, 0],
//   //         description: '',
//   //         address: '',
//   //       },
//   //     });

//   //   const res = await request(app)
//   //     .get('/api/v1/tours?limit=2')
//   //     .set('Authorization', `Bearer ${token}`);
//   //   expect(res.statusCode).toBe(200);
//   //   expect(res.body.data.data.length).toBe(2);
//   // });

//   // it('GET /api/v1/tours?sort=price - trả về tour đã được sort theo price', async () => {
//   //   const res = await request(app)
//   //     .get('/api/v1/tours?sort=price')
//   //     .set('Authorization', `Bearer ${token}`);
//   //   expect(res.statusCode).toBe(200);
//   //   const tours = res.body.data.data;
//   //   for (let i = 1; i < tours.length; i++) {
//   //     expect(tours[i].price).toBeGreaterThanOrEqual(tours[i - 1].price);
//   //   }
//   // });

//   // //kiểm tra token
//   // it('GET /api/v1/tours - lấy tất cả tour', async () => {
//   //   const resCreate = await request(app)
//   //     .post('/api/v1/tours')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send({
//   //       name: 'Test Tour 01',
//   //       price: 'abd',
//   //       duration: 5,
//   //       difficulty: 'easy',
//   //       maxGroupSize: 10,
//   //       summary: 'A great tour for testing purposes',
//   //       description: 'Test description',
//   //       imageCover: 'cover.jpg',
//   //       startLocation: {
//   //         type: 'Point',
//   //         coordinates: [105.85, 21.03],
//   //         description: 'Hà Nội, Việt Nam',
//   //         address: 'Hà Nội',
//   //       },
//   //     });

//   //   const res = await request(app)
//   //     .get('/api/v1/tours')
//   //     .set('Authorization', `Bearer ${token}`);
//   //   expect(res.statusCode).toBe(200);
//   //   console.log(res.statusCode);
//   //   expect(Array.isArray(res.body.data.data)).toBe(true);
//   //   expect(res.body.data.data.length).toBeGreaterThanOrEqual(1);
//   // }, 15000);
//   // it('tạo tour mới', async () => {
//   //   const res = await request(app)
//   //     .post('/api/v1/tours')
//   //     .set('Authorization', `Bearer ${token}`)
//   //     .send({
//   //       name: 'Test Tour 02',
//   //       price: 'ạhhs',
//   //       duration: 7,
//   //       difficulty: 'medium',
//   //       maxGroupSize: 15,
//   //       summary: 'Another test tour',
//   //       description: 'Test description 2',
//   //       imageCover: 'cover2.jpg',
//   //       startLocation: {
//   //         type: 'Point',
//   //         coordinates: [106, 21],
//   //         description: 'Hà Nội, Việt Nam',
//   //         address: 'Hà Nội',
//   //       },
//   //       // createdBy: 'testUser',
//   //     });
//   //   expect(res.statusCode).toBe(201);
//   //   expect(res.body.data.doc).toHaveProperty('_id');

//   //   createdId = res.body.data.doc._id;
//   // }, 15000);

//   // cách Endpoint đặc biêt

//   // it('GET /api/v1/tours/top-5-cheap trả về tối đa 5 tour', async () => {
//   //   const res = await request(app)
//   //     .get(`/api/v1/tours/top-5-cheap`)
//   //     .set('Authorization', `Bearer ${token}`);

//   //   expect(res.statusCode).toBe(200);
//   //   expect(Array.isArray(res.body.data.data)).toBe(true);
//   //   expect(res.body.data.data.length).toBeLessThanOrEqual(5);
//   // });

//   // ...existing code...

//   describe('Các endpoint đặc biệt của Tour', () => {
//     let token;
//     beforeEach(() => {
//       token = generateToken();
//     });

//     it('GET /api/v1/tours/monthly-plan/:year trả về kế hoạch tour theo tháng', async () => {
//       // Tạo tour với startDates trong năm 2025
//       await request(app)
//         .post('/api/v1/tours')
//         .set('Authorization', `Bearer ${token}`)
//         .send({
//           name: 'Tour Kế Hoạch Tháng',
//           price: 100,
//           duration: 5,
//           difficulty: 'easy',
//           maxGroupSize: 10,
//           summary: 'Test monthly plan',
//           description: 'Test description',
//           imageCover: 'cover.jpg',
//           startLocation: {
//             type: 'Point',
//             coordinates: [105.85, 21.03],
//             description: 'Hà Nội',
//             address: 'Hà Nội',
//           },
//           startDates: ['2025-03-01', '2025-07-01'],
//         });

//       const res = await request(app)
//         .get('/api/v1/tours/monthly-plan/2025')
//         .set('Authorization', `Bearer ${token}`);

//       expect(res.statusCode).toBe(200);
//       expect(Array.isArray(res.body.data.plan)).toBe(true);
//       expect(res.body.data.plan.length).toBeGreaterThan(0);
//     });

//     it('GET /api/v1/tours/tours-within/:distance/center/:latlng/unit/:unit trả về các tour trong bán kính', async () => {
//       // Tạo tour gần Hà Nội
//       await request(app)
//         .post('/api/v1/tours')
//         .set('Authorization', `Bearer ${token}`)
//         .send({
//           name: 'Tour Gần Hà Nội',
//           price: 100,
//           duration: 5,
//           difficulty: 'easy',
//           maxGroupSize: 10,
//           summary: 'Test nearby',
//           description: 'Test description',
//           imageCover: 'cover.jpg',
//           startLocation: {
//             type: 'Point',
//             coordinates: [105.85, 21.03],
//             description: 'Hà Nội',
//             address: 'Hà Nội',
//           },
//         });

//       const res = await request(app)
//         .get('/api/v1/tours/tours-within/50/center/21.03,105.85/unit/km')
//         .set('Authorization', `Bearer ${token}`);

//       expect(res.statusCode).toBe(200);
//       expect(Array.isArray(res.body.data.data)).toBe(true);
//       expect(res.body.data.data.length).toBeGreaterThan(0);
//     });

//     it('GET /api/v1/tours/distances/:latlng/unit/:unit trả về khoảng cách đến các tour', async () => {
//       // Tạo tour gần Hà Nội
//       await request(app)
//         .post('/api/v1/tours')
//         .set('Authorization', `Bearer ${token}`)
//         .send({
//           name: 'Tour Đo Khoảng Cách',
//           price: 100,
//           duration: 5,
//           difficulty: 'easy',
//           maxGroupSize: 10,
//           summary: 'Test distance',
//           description: 'Test description',
//           imageCover: 'cover.jpg',
//           startLocation: {
//             type: 'Point',
//             coordinates: [105.85, 21.03],
//             description: 'Hà Nội',
//             address: 'Hà Nội',
//           },
//         });

//       const res = await request(app)
//         .get('/api/v1/tours/distances/100/21.03,105.85/unit/km')
//         .set('Authorization', `Bearer ${token}`);

//       console.log(res.body);
//       expect(res.statusCode).toBe(200);
//       expect(Array.isArray(res.body.data)).toBe(true);
//       expect(res.body.data.length).toBeGreaterThan(0);
//       expect(res.body.data[0]).toHaveProperty('distance');
//       expect(res.body.data[0]).toHaveProperty('name');
//     });
//   });

//   // ...existing code...
// });

// afterAll(async () => {
//   await mongoose.connection.close();
// });
