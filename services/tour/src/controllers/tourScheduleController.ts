import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import { toTourScheduleDto } from '../dtos/tourSchedule.dto';
import filterFieldsSoft from '../utils/filterFieldsSoft';
import { TourScheduleService } from '../services/tourScheduleService';

// Create New Tour Schedule
export const createSchedule = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tourId } = req.params;
    const allowed = ['startDate', 'price', 'maxGroupSize', 'status', 'bookedSeats'];
    const scheduleData = filterFieldsSoft(req.body, allowed);
    const rawSchedule = await TourScheduleService.createSchedule(
      tourId,
      scheduleData as any
    );
    const newSchedule = toTourScheduleDto(rawSchedule);
    res.status(201).json({
      status: 'success',
      data: { data: newSchedule },
    });
  }
);

// Get All Tour Schedule

export const getAllSchedule = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tourId } = req.params;
    const schedules = await TourScheduleService.getAllSchedule(tourId);
    const scheduleDto = schedules.map(schedule => toTourScheduleDto(schedule));
    res.status(200).json({
      status: 'success',
      results: scheduleDto.length,
      data: { data: scheduleDto },
    });
  }
);

// Update Schedule
export const updateSchedule = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tourId, scheduleId } = req.params;
    const allowed = ['startDate', 'price', 'maxGroupSize', 'status', 'bookedSeats'];
    const updates = filterFieldsSoft(req.body, allowed);
    const rawSchedule = await TourScheduleService.updateSchedule(
      tourId,
      scheduleId,
      updates
    );
    const updateScheduleDto = toTourScheduleDto(rawSchedule);
    res.status(200).json({
      status: 'success',
      data: { data: updateScheduleDto },
    });
  }
);
// Delete Schedule
export const deleteSchedule = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tourId, scheduleId } = req.params;
    await TourScheduleService.deleteSchedule(tourId, scheduleId);
    res.status(204).send();
  }
);

export const bookedSeats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { scheduleId } = req.params;
    const { numberOfGuests } = req.body;
    const updateSchedule = await TourScheduleService.bookedSeats(
      Number(scheduleId),
      Number(numberOfGuests)
    );
    const scheduleDto = toTourScheduleDto(updateSchedule);
    res.status(200).json({
      status: 'success',
      data: scheduleDto,
    });
  }
);
