import mongoose from 'mongoose';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import createBookingWithValidation from '../utils/bookingUtil.js';
import { getUserById } from '../services/userClient.js';
import { getTourById } from '../services/tourClient.js';
import { sendEmailNotification } from '../services/notificationClient.js';
import { createCheckoutSession } from '../services/paymentClient.js';

export const createBooking = (Model, options = {}) =>
  catchAsync(async (req, res, next) => {
    if (Model.modelName !== 'Booking') {
      return next(new AppError('Invalid model for booking creation ', 400));
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { tourId, date, numberOfGuests = 1 } = req.body;
      const userId = req.user?._id || req.body.userId;
      if (!userId || !tourId || !date) {
        return next(new AppError('Missing userId, tourId or date', 400));
      }
      // user-tour : service
      const [userSnap, tourSnap] = await Promise.all([
        getUserById(userId),
        getTourById(tourId),
      ]);
      if (!tourSnap) {
        return next(new AppError('Tour not found', 404));
      }
      const price = Number(tourSnap.price) * numberOfGuests;
      const newBooking = await createBookingWithValidation({
        data: {
          user: userId,
          tour: tourId,
          date,
          price,
          numberOfGuests,
          customer_name: userSnap?.name || 'User',
          email: userSnap?.email || undefined,
          status: 'pending',
        },
        user: req.user,
        preventDupticate: Array.isArray(options.preventDupticate),
        session,
      });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        status: 'success',
        message: 'Booking created successfully',
        data: { doc: newBooking },
      });
      //send Mail
      const textSendMail = `
      Hello ${newBooking.customer_name || ''},
      Thank you for booking the tour "${newBooking.tour?.toString() || ''}".
      Departure date: ${new Date(newBooking.date).toLocaleDateString()}`;

      setImmediate(() => {
        sendEmailNotification({
          to: newBooking.email,
          subject: 'Booking Confirmation',
          text: textSendMail,
        }).catch(err => console.error('sendEmailBooking exception:', err.message));
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      next(err);
    }
  });
