import { Request, Response, NextFunction } from 'express';
import { TourService } from '../services/tourService';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import filterFieldsSoft from '../utils/filterFieldsSoft';
import {
  toTourResponseDto,
  FilterTourQueryDto,
  CreateTourDto,
  UpdateTourDto,
} from '../dtos/tour.dto';

// Create Tour
export const createTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allowed: (keyof CreateTourDto)[] = [
      'name',
      'duration',
      'maxGroupSize',
      'difficulty',
      'price',
      'priceDiscount',
      'summary',
      'description',
      'imageCover',
      'images',
      'startDates',
      'startLocation',
      'locations',
      'isPublished',
      'guides',
    ];

    const tourData = filterFieldsSoft(req.body, allowed) as CreateTourDto;
    if (req.user && req.user.id) {
      tourData.createdBy = Number(req.user.id);
    }
    const newTour = await TourService.createTour(tourData);
    const TourDto = toTourResponseDto(newTour);
    res.status(201).json({
      status: 'success',
      data: TourDto,
    });
  }
);
// Get All Tour
export const getAllTours = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const queryString = req.query as unknown as FilterTourQueryDto;
    const tours = await TourService.getAllTours(queryString);
    const toursDto = tours.map(tour => toTourResponseDto(tour));
    res.status(200).json({
      status: 'success',
      results: toursDto.length,
      data: toursDto,
    });
  }
);

//Get Tour ID or Slug
export const getTourID = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const rawTour = await TourService.getTourByIdOrSlug(id);
    const tourDto = toTourResponseDto(rawTour);
    res.status(200).json({
      status: 'success',
      data: tourDto,
    });
  }
);

// Update Tour
export const updateTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const allwowed: (keyof UpdateTourDto)[] = [
      'name',
      'duration',
      'maxGroupSize',
      'difficulty',
      'price',
      'priceDiscount',
      'summary',
      'description',
      'imageCover',
      'images',
      'startDates',
      'startLocation',
      'locations',
      'isPublished',
      'guides',
    ];
    const updates = filterFieldsSoft(req.body, allwowed) as UpdateTourDto;
    const rawTour = await TourService.updateTour(id, updates);
    const updateTourDto = toTourResponseDto(rawTour);
    res.status(200).json({
      status: 'success',
      data: updateTourDto,
    });
  }
);
/// Deletet Tour
export const deleteTour = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await TourService.deleteTour(id);
  res.status(204).send();
});

//Get Tour Stats
export const getTourStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await TourService.getTourStats();
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

// Get Monthly Plan
export const getMonthlyPlan = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const year = parseInt(req.params.year, 10);
    if (isNaN(year)) {
      return next(new AppError('Please provide a valid year', 400));
    }
    const plan = await TourService.getMonthlyPlan(year);
    res.status(200).json({
      status: 'success',
      data: plan,
    });
  }
);

//Get Tour Within Distance
export const getTourWithin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { distance: distanceStr, latlng, unit } = req.params;
    const distance = parseFloat(distanceStr);
    const [lat, lng] = latlng.split(',').map(Number);
    if (isNaN(distance) || isNaN(lat) || isNaN(lng)) {
      return next(new AppError('Invalid coordinates or distance value', 400));
    }
    const tourWithin = await TourService.getToursWithin(
      distance,
      lat,
      lng,
      unit as 'mi' | 'km'
    );
    res.status(200).json({
      status: 'success',
      results: tourWithin.length,
      data: tourWithin,
    });
  }
);
// Get Distances From Location
export const getDistancens = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) {
      return next(new AppError('Invalid coordinates format. Use lat,lng', 400));
    }
    const distances = await TourService.getDistances(lat, lng, unit as 'mi' | 'km');
    res.status(200).json({
      status: 'success',
      data: distances,
    });
  }
);
// Get All Deleted
export const getAllDeletedTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const queryString = req.query as unknown as FilterTourQueryDto;
    const deletedTours = await TourService.getDeletedTourAll(queryString);
    const deletedDto = deletedTours.map(tour => {
      return toTourResponseDto(tour);
    });
    res.status(200).json({
      status: 'success',
      results: deletedDto.length,
      data: deletedDto,
    });
  }
);
// Restore Tour
export const restoreTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await TourService.restoreTour(id);
    res.status(200).send();
  }
);
