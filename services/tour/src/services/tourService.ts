import { Op, fn, col, where } from 'sequelize';
import { Tour, TourSchedule } from '../models/index';
import AppError from '../utils/appError';
import APIFeatures from '../utils/apiFeatures';
import { TourAttributes } from '../models/tourModel';
import { EARTH_RADIUS_MILES, EARTH_RADIUS_KM } from '../utils/constant';
import { CreateTourDto, UpdateTourDto, FilterTourQueryDto } from '../dtos/tour.dto';

// Haversine formula distance calculator
const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: 'mi' | 'km'
): number => {
  const R = unit === 'mi' ? EARTH_RADIUS_MILES : EARTH_RADIUS_KM;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon1 - lon2) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export class TourService {
  // Create Tour
  static async createTour(dto: CreateTourDto): Promise<Tour> {
    return await Tour.create(dto as any);
  }

  // Update Tour
  static async updateTour(id: string, dto: UpdateTourDto): Promise<Tour> {
    const tour = await Tour.findByPk(id);
    if (!tour) {
      throw new AppError('No tour found with that ID', 404);
    }
    await tour.update(dto);
    return tour;
  }

  // Delete Tour
  static async deleteTour(id: string): Promise<void> {
    const tour = await Tour.findByPk(id);
    if (!tour) {
      throw new AppError('No tour found with that ID', 404);
    }
    await tour.destroy({ force: false });
  }

  // Get All Tours
  static async getAllTours(dto: FilterTourQueryDto): Promise<Tour[]> {
    const features = new APIFeatures(dto as any)
      .filter()
      .limitFields()
      .paginate()
      .sort();
    return await Tour.findAll(features.getOptions());
  }

  // Get Tour ID or Slug
  static async getTourByIdOrSlug(id: string): Promise<Tour> {
    const isNumeric = /^\d+$/.test(id);
    const tour = isNumeric
      ? await Tour.findByPk(id, {
          include: [{ model: TourSchedule, as: 'schedules' }],
        })
      : await Tour.findOne({
          where: { slug: id },
          include: [{ model: TourSchedule, as: 'schedules' }],
        });
    if (!tour) {
      throw new AppError('No tour found with that ID or slug', 404);
    }
    return tour;
  }

  // Get Tour Stats
  static async getTourStats(): Promise<any[]> {
    return await Tour.findAll({
      attributes: [
        'difficulty',
        [fn('COUNT', col('id')), 'numTours'],
        [fn('AVG', col('ratingsAverage')), 'avgRating'],
        [fn('AVG', col('price')), 'avgPrice'],
        [fn('MIN', col('price')), 'minPrice'],
        [fn('MAX', col('price')), 'maxPrice'],
      ],
      group: ['difficulty'],
    });
  }

  // Get Monthly Plan
  static async getMonthlyPlan(year: number): Promise<any[]> {
    const tours = await Tour.findAll();
    const plan: Record<number, { name: string; date: Date }[]> = {};
    tours.forEach(tour => {
      if (tour.startDates && Array.isArray(tour.startDates)) {
        tour.startDates.forEach((dateVal: any) => {
          const date = new Date(dateVal);
          if (date.getFullYear() === year) {
            const month = date.getMonth() + 1;
            if (!plan[month]) plan[month] = [];
            plan[month].push({ name: tour.name, date });
          }
        });
      }
    });
    return Object.keys(plan)
      .map(month => {
        const m = parseInt(month, 10);
        return {
          month: m,
          results: plan[m].length,
          tours: plan[m].map(t => t.name),
        };
      })
      .sort((a, b) => a.month - b.month);
  }

  // Get Tours Within Distance
  static async getToursWithin(
    distance: number,
    lat: number,
    lng: number,
    unit: 'mi' | 'km'
  ): Promise<Tour[]> {
    const allTour = await Tour.findAll();
    return allTour.filter(tour => {
      const startLoc = tour.startLocation as any;
      if (startLoc && startLoc.coordinates && Array.isArray(startLoc.coordinates)) {
        const [tLng, tLat] = startLoc.coordinates;
        const dist = calculateHaversineDistance(lat, lng, tLat, tLng, unit);
        return dist <= distance;
      }
      return false;
    });
  }

  // Get Distances From Location
  static async getDistances(
    lat: number,
    lng: number,
    unit: 'mi' | 'km'
  ): Promise<any[]> {
    const allTours = await Tour.findAll();
    return allTours
      .map(tour => {
        const startLoc = tour.startLocation as any;
        if (
          startLoc &&
          startLoc.coordinates &&
          Array.isArray(startLoc.coordinates)
        ) {
          const [tLng, tLat] = startLoc.coordinates;
          const dist = calculateHaversineDistance(lat, lng, tLat, tLng, unit);
          return { id: tour.id, name: tour.name, distance: dist };
        }
        return null;
      })
      .filter(
        (val): val is { id: number; name: string; distance: number } => val !== null
      );
  }
  // Get Deleted Tour All
  static async getDeletedTourAll(dto: FilterTourQueryDto): Promise<Tour[]> {
    const features = new APIFeatures<TourAttributes>(dto as any)
      .filter()
      .limitFields()
      .paginate()
      .sort();
    const options = features.getOptions();
    options.where = {
      ...options.where,
      deletedAt: { [Op.ne]: null },
    };
    options.paranoid = false;
    return await Tour.findAll(options);
  }

  // Restore Tour
  static async restoreTour(id: string): Promise<void> {
    const tour = await Tour.findByPk(id, { paranoid: false });
    if (!tour) {
      throw new AppError('Tour not Found', 404);
    }
    if (tour.deletedAt === null) {
      throw new AppError('Tour is not deleted', 400);
    }
    return tour.restore();
  }
}
