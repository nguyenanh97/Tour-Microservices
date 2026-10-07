import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import filterFieldsSoft from '../utils/filterFieldsSoft';
import {
  toBookingResponseDto,
  CreateBookingDto,
  UpdateBookingAdminDto,
  UpdateBookingDto,
  FilterBookingQueryDto,
} from '../dtos/booking.dto';
import { BookingService } from '../services/bookingService';
import Booking from '../models/bookingModel';
//import createBookingWithValidation from '../utils/bookingUtil.js';

export const createBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401),
      );
    }
    const userId = req.user.id;

    const allowed: (keyof CreateBookingDto)[] = [
      'tourId',
      'tourScheduleId',
      'numberOfGuests',
      'customerName',
      'customerEmail',
      'customerPhone',
    ];
    const bookingData = filterFieldsSoft(req.body, allowed) as CreateBookingDto;
    const rawBooking = await BookingService.createBooking(userId, bookingData);
    const newBookingDto = toBookingResponseDto(rawBooking);
    res.status(201).json({
      status: 'success',
      data: newBookingDto,
    });
  },
);

// Update booking (Me)
export const updateBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401),
      );
    }
    const { id } = req.params;
    const userId = req.user.id;
    const allowed: (keyof UpdateBookingDto)[] = [
      'customerName',
      'customerEmail',
      'customerPhone',
      'numberOfGuests',
    ];
    const updateData = filterFieldsSoft(req.body, allowed) as UpdateBookingDto;
    const updateBooking = await BookingService.updateBooking(
      Number(id),
      userId,
      updateData,
    );
    const bookingDto = toBookingResponseDto(updateBooking);
    res.status(200).json({
      status: 'success',
      data: bookingDto,
    });
  },
);

// Get Booking Id
export const getBookingId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401),
      );
    }
    const bookinggId = Number(req.params.id);
    const targetUSerId = req.user.role === 'admin' ? undefined : req.user.id;
    const rawBooking = await BookingService.getBookingId(bookinggId, targetUSerId);
    const bookingDto = toBookingResponseDto(rawBooking);
    res.status(200).json({
      status: 'success',
      data: bookingDto,
    });
  },
);

// Get All Booking Me
export const getMeBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id || (req.header('x-user-id') as string);
    if (!userId) {
      return next(new AppError('Unauthorized - Please log in to get access.', 401));
    }
    const queryString = req.query as unknown as FilterBookingQueryDto;

    const { bookings, pagination } = await BookingService.getMeBookings(
      userId,
      queryString,
    );
    const bookingDto = bookings.map(b => toBookingResponseDto(b));
    res.status(200).json({
      status: 'success',
      results: bookingDto.length,
      pagination,
      data: bookingDto,
    });
  },
);

/// Cencel Booking
export const cancelBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401),
      );
    }

    const bookingId = Number(req.params.id);
    if (isNaN(bookingId) || bookingId <= 0) {
      return next(
        new AppError('Invalid booking ID. ID must be a positive number.', 400),
      );
    }
    const targetUserId = req.user.role === 'admin' ? undefined : req.user.id;
    const cancelledBooking = await BookingService.cancelBooking(
      bookingId,
      targetUserId,
    );
    const bookingDto = toBookingResponseDto(cancelledBooking);
    res.status(200).json({
      status: 'success',
      message: 'Booking has been successfully cancelled.',
      data: bookingDto,
    });
  },
);

/// ADMIN

// GetAll Bookings
export const getAllBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const roleUserId = req.user?.role || (req.header('x-user-role') as string);
    if (roleUserId !== 'admin') {
      return next(
        new AppError(
          'You do not have permission to perform this action. Admin only.',
          403,
        ),
      );
    }

    const queryString = req.query as unknown as FilterBookingQueryDto;
    const { bookings, pagination } =
      await BookingService.getAllBookings(queryString);
    const bookingDto = bookings.map(b => toBookingResponseDto(b));
    res.status(200).json({
      status: 'success',
      results: bookingDto.length,
      pagination,
      data: bookingDto,
    });
  },
);
// Update Booking Status
export const updateBookingAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const allowed: (keyof UpdateBookingAdminDto)[] = [
      'status',
      'paymentStatus',
      'paymentIntentId',
    ];
    const updateData = filterFieldsSoft(req.body, allowed) as UpdateBookingAdminDto;

    const updateBooking = await BookingService.updateBookingStatus(
      Number(id),
      updateData,
    );
    const bookingDto = toBookingResponseDto(updateBooking);
    res.status(200).json({ status: 'success', data: bookingDto });
  },
);
