import AppError from './appError.js';
import Booking from '../models/bookingModel.js';

const createBookingWithValidation = async ({
  data,
  user,
  preventDupticate = true,
}) => {
  // gán nếu chưa có user
  if (!data.user && user?.id) {
    data.user = user.id;
  }
  if (user) {
    if (!data.email) data.email = user.email;
    if (!data.customer_name) data.customer_name = user.name || user.customer_name;
  }
  //kiểm tra ngày
  const bookingDate = new Date(data.date);
  if (!data.date || isNaN(bookingDate.getTime())) {
    throw new AppError('Invalid or missing booking date', 400);
  }
  // Kiểm tra số người tham gia
  if (!data.numberOfGuests || data.numberOfGuests < 1) {
    throw new AppError('Number of guests must be at least 1', 400);
  }
  if (preventDupticate) {
    const { tour, date } = data;
    if (!user || !tour || !date) {
      throw new AppError('Missing user, tour, or date for duplicate check', 400);
    }
    const exists = await Booking.findOne({ tour, user: data.user, date });
    if (exists) {
      throw new AppError(
        'You have already booked this tour on the selected date',
        400,
      );
    }
  }

  //Tạo Booking

  let newBooking;
  try {
    newBooking = await Booking.create(data);
  } catch (err) {
    console.error('Error creating booking:', err);
    if (err.code === 11000) {
      throw new AppError('Duplicate booking database level', 400);
    }
    throw err;
  }
  return newBooking;
};
export default createBookingWithValidation;
