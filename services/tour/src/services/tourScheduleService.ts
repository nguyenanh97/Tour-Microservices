import { TourSchedule, Tour } from '../models/index';
import { CreateScheduleDto, UpdateScheduleDto } from '../dtos/tourSchedule.dto';
import sequelize from '../configs/db';
import AppError from '../utils/appError';

export class TourScheduleService {
  // Create Tour
  static async createSchedule(
    tourId: number | string,
    dto: CreateScheduleDto
  ): Promise<TourSchedule> {
    const tourIdNum = Number(tourId);

    const tour = await Tour.findByPk(tourId);
    if (!tour) {
      throw new AppError('No tour found with that ID', 404);
    }
    if (dto.startDate) {
      const today = new Date();
      if (new Date(dto.startDate) <= today) {
        throw new AppError('Start date must be in the future', 400);
      }
    }
    const schendule = await TourSchedule.create({
      ...dto,
      tourId: tourIdNum,
    });
    return schendule;
  }

  // Get All TourSchedule
  static async getAllSchedule(tourId: string): Promise<TourSchedule[]> {
    const tour = await Tour.findByPk(tourId);
    if (!tour) {
      throw new AppError('No tour found with that ID', 404);
    }
    return await TourSchedule.findAll({
      where: { tourId: Number(tourId) },
    });
  }

  // Update TourSchedule
  static async updateSchedule(
    tourId: string,
    scheduleId: string,
    dto: UpdateScheduleDto
  ): Promise<TourSchedule> {
    const schedule = await TourSchedule.findOne({
      where: { id: Number(scheduleId), tourId: Number(tourId) },
    });
    if (!schedule) {
      throw new AppError('No schedule found with that ID for this tour', 404);
    }
    if (dto.startDate) {
      const today = new Date();
      if (new Date(dto.startDate) <= today) {
        throw new AppError('Start date must be in the future', 400);
      }
    }
    await schedule.update(dto);
    return schedule;
  }
  // Xoá lich trình Tour
  static async deleteSchedule(tourId: string, scheduleId: string): Promise<void> {
    const schedule = await TourSchedule.findOne({
      where: {
        id: Number(scheduleId),
        tourId: Number(tourId),
      },
    });
    if (!schedule) {
      throw new AppError('No schedule found with that ID for this tour', 404);
    }
    await schedule.destroy();
  }

  // BookedSeats
  static async bookedSeats(
    scheduleId: number,
    numberOfGuests: number
  ): Promise<TourSchedule> {
    return await sequelize.transaction(async t => {
      const schedule = await TourSchedule.findByPk(scheduleId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!schedule) {
        throw new AppError('Tour schedule not found', 404);
      }
      if (schedule.status === 'cancelled') {
        throw new AppError('Cannot adjust seats for a cancelled schedule', 400);
      }
      const newBookedSeats = schedule.bookedSeats + numberOfGuests;

      if (newBookedSeats < 0) {
        throw new AppError('Booked seats cannot be less than 0', 400);
      }
      if (newBookedSeats > schedule.maxGroupSize) {
        const available = schedule.maxGroupSize - schedule.bookedSeats;
        throw new AppError(
          `Not enough available seats. There are only ${available} seats left on this schedule.`,
          400
        );
      }

      let newStatus = schedule.status;
      if (newBookedSeats === schedule.maxGroupSize) {
        newStatus = 'full';
      } else if (
        schedule.status === 'full' &&
        newBookedSeats < schedule.maxGroupSize
      ) {
        newStatus = 'active';
      }
      await schedule.update(
        {
          bookedSeats: newBookedSeats,
          status: newStatus,
        },
        { transaction: t }
      );
      return schedule;
    });
  }
}
