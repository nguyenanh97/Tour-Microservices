import { Op } from 'sequelize';
import Booking, {
  BookingCreationAttributes,
  BookingAttributes,
} from '../models/bookingModel';
import AppError from '../utils/appError';
import {
  CreateBookingDto,
  UpdateBookingAdminDto,
  UpdateBookingDto,
  FilterBookingQueryDto,
} from '../dtos/booking.dto';

import APIFeatures from '../utils/apiFeatures';
import { getUserById } from '../clients/userClient';
import { getTourById, scheduleSeats } from '../clients/tourClient';
import { sendEmailNotification } from '../clients/notificationClient';

export class BookingService {
  static async createBooking(
    userId: string,
    dto: CreateBookingDto,
  ): Promise<Booking> {
    // Promiss
    const [user, tour] = await Promise.all([
      getUserById({ userId }),
      getTourById({ tourId: dto.tourId }),
    ]);
    if (!user) {
      throw new AppError('User profile not found. Cannot create booking.', 404);
    }
    if (!tour) {
      throw new AppError('Tour not found.', 404);
    }

    //schedule
    const schedules = tour.schedules || [];
    const matchedSchedule = schedules.find(
      s => Number(s.id) === Number(dto.tourScheduleId),
    );
    if (!matchedSchedule) {
      throw new AppError('Departure schedule not found for this tour.', 404);
    }


    //
    const existingBooking = await Booking.findOne({
      where: {
        userId,
        tourScheduleId: dto.tourScheduleId,
        status: {
          [Op.in]: ['pending', 'confirmed'],
        },
      },
    });
    if (existingBooking) {
      throw new AppError(
        'You already have an active tour booking for this departure date.',
        400,
      );
    }

    await scheduleSeats({
      scheduleId: dto.tourScheduleId,
      numberOfGuests: dto.numberOfGuests,
    });

    // total Booking
    const pricePerGuest = Number(matchedSchedule.price || tour.price);
    const totalPrice = pricePerGuest * dto.numberOfGuests;

    // seve Database
    const bookingData: BookingCreationAttributes = {
      userId,
      tourId: dto.tourId,
      tourScheduleId: dto.tourScheduleId,
      customerName: dto.customerName || user.name,
      customerEmail: dto.customerEmail || user.email || '',
      customerPhone: dto.customerPhone,
      numberOfGuests: dto.numberOfGuests,
      pricePerGuest,
      totalPrice,
    };
    let booking: Booking;
    try {
      booking = await Booking.create(bookingData);
    } catch (err: any) {
      scheduleSeats({
        scheduleId: dto.tourScheduleId,
        numberOfGuests: -dto.numberOfGuests,
      }).catch(e =>
        console.error(
          '[BookingService] Failed to compensate bookedSeats:',
          e.message,
        ),
      );
      throw err;
    }
    setImmediate(() => {
      const emailContent = `Dear ${bookingData.customerName},
        Thank you for booking the tour "${tour.name}".
        Number of guests: ${bookingData.numberOfGuests} tickets.
        Total payment: $${bookingData.totalPrice} USD.
        Payment status: Pending.`;

      sendEmailNotification({
        to: bookingData.customerEmail,
        subject: 'Tour Booking Confirmed',
        text: emailContent,
      }).catch(err =>
        console.error(
          '[BookingService] Failed to send confirmation email:',
          err.message,
        ),
      );
    });
    return booking;
  }

  // Update Booking (User)
  static async updateBooking(
    bookingid: number,
    userid: string,
    dto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await Booking.findByPk(bookingid);
    if (!booking) {
      throw new AppError('No Booking Found with that ID', 404);
    }
    if (booking.userId !== userid) {
      throw new AppError('You do not have permission to update this booking.', 403);
    }
    if (booking.status !== 'pending') {
      throw new AppError(
        `Cannot update booking with status "${booking.status}". Only pending bookings can be updated.`,
        400,
      );
    }
    const updates: any = { ...dto };
    if (dto.numberOfGuests && dto.numberOfGuests !== booking.numberOfGuests) {
      const seatsDelta = dto.numberOfGuests - booking.numberOfGuests;
      await scheduleSeats({
        scheduleId: booking.tourScheduleId,
        numberOfGuests: seatsDelta,
      });
      // Tính lại tổng tiền theo số lượng khách mới
      updates.totalPrice = Number(booking.pricePerGuest) * dto.numberOfGuests;
    }

    await booking.update(updates);
    return booking;
  }

  // Get ALL Booking Me
  static async getMeBookings(userId: string, dto: FilterBookingQueryDto) {
    const features = new APIFeatures<BookingAttributes>(dto as any)
      .filter()
      .sort()
      .paginate(10, 50);
    const options = features.getOptions();
    options.where = {
      ...(options.where as object),
      userId,
    };
    const { rows, count } = await Booking.findAndCountAll(options);
    return { bookings: rows, pagination: features.getPaginationMetadata(count) };
  }
  // Get Booking ID
  static async getBookingId(bookingId: number, userId?: string): Promise<Booking> {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new AppError('Booking not found.', 404);
    }
    if (userId && booking.userId !== userId) {
      throw new AppError('You do not have permission to view this booking.', 403);
    }
    return booking;
  }

  // Cancel Booking
  static async cancelBooking(bookingId: number, userId?: string): Promise<Booking> {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new AppError('No Booking found with that ID', 404);
    }
    if (userId && booking.userId !== userId) {
      throw new AppError('You do not have permission to cancel this booking.', 403);
    }
    if (booking.status === 'cancelled') {
      throw new AppError('This booking has already been cancelled', 400);
    }
    if (booking.status === 'refunded') {
      throw new AppError('Cannot cancel a refunded booking', 400);
    }
    await booking.update({ status: 'cancelled' });

    try {
      await scheduleSeats({
        scheduleId: booking.tourScheduleId,
        numberOfGuests: -booking.numberOfGuests,
      });
    } catch (err: any) {
      console.error(
        `[BookingService] Warning: Failed to release seats for booking ${bookingId}:`,
        err.message,
      );
    }
    setImmediate(() => {
      sendEmailNotification({
        to: booking.customerEmail,
        subject: `Booking ${booking.id} has been cancelled`,
        text: `Dear ${booking.customerName}, your booking #${booking.id} has been successfully cancelled.`,
      }).catch(err =>
        console.error(
          '[BookingService] Failed to send cancellation email:',
          err.message,
        ),
      );
    });

    return booking;
  }

  /// ADMIN

  //Get All Bookings
  static async getAllBookings(dto: FilterBookingQueryDto) {
    const features = new APIFeatures<BookingAttributes>(dto as any)
      .filter()
      .sort()
      .paginate(20, 100);

    const { rows, count } = await Booking.findAndCountAll(features.getOptions());
    return {
      bookings: rows,
      pagination: features.getPaginationMetadata(count), // <-- Tự động tính toán pagination ở đây
    };
  }

  // Update Status
  static async updateBookingStatus(
    bookingId: number,
    dto: UpdateBookingAdminDto,
  ): Promise<Booking> {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new AppError('No Booking Found with that ID', 404);
    }
    if (dto.status && dto.status !== booking.status) {
      const isOldActive = ['pending', 'confirmed'].includes(booking.status);
      const isNewActive = ['pending', 'confirmed'].includes(dto.status);
      if (isOldActive && !isNewActive) {
        await scheduleSeats({
          scheduleId: booking.tourScheduleId,
          numberOfGuests: -booking.numberOfGuests,
        });
      } else if (!isOldActive && isNewActive) {
        await scheduleSeats({
          scheduleId: booking.tourScheduleId,
          numberOfGuests: booking.numberOfGuests,
        });
      }
    }
    await booking.update(dto);
    return booking;
  }
}
