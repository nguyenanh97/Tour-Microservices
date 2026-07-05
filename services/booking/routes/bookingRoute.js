import express from 'express';
import * as conTronller from '../controllers/bookingController.js';
const router = express.Router();
router.route('/').post(conTronller.createBooking);

export default router;
