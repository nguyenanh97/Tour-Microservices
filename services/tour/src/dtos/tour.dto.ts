import { TourAttributes } from '../models/tourModel';
import { GeoPoint, TourLocation } from '../models/types/geo-point';
import Tour from '../models/tourModel';

// create DTO
export interface CreateTourDto extends Omit<
  TourAttributes,
  | 'id'
  | 'slug'
  | 'ratingsAverage'
  | 'ratingsQuantity'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'isPublished'
> {
  name: string;
  duration: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  price: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover: string;
  images?: string[];
  startLocation?: GeoPoint;
  locations?: TourLocation[];
  isPublished?: boolean;
  guides?: number[];
}

// Update DTO
export type UpdateTourDto = Partial<CreateTourDto>;

// FilterQuery DTO
export interface FilterTourQueryDto {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  difficulty?: 'easy' | 'medium' | 'difficult';
  price?: number;
  duration?: number;
  ratingsAverage?: number;
}

// Response DTO
export interface ResponseTourDto {
  id: number;
  name: string;
  slug: string;
  duration: number;
  durationWeeks?: number; // Trường ảo
  maxGroupSize: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  price: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover?: string;
  images: string[];
  startDates: string[];
  startLocation?: GeoPoint;
  locations?: TourLocation[];
  isPublished: boolean;
  guides?: number[];
  schedules?: any[];
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}
//Hàm chuyển đổi Model sang DTO (Mapper)
export function toTourResponseDto(tour: Tour): ResponseTourDto {
  return {
    id: tour.id,
    name: tour.name,
    slug: tour.slug,
    duration: tour.duration,
    durationWeeks: tour.durationWeeks,
    maxGroupSize: tour.maxGroupSize,
    difficulty: tour.difficulty,
    price: tour.price,
    priceDiscount: tour.priceDiscount,
    summary: tour.summary,
    description: tour.description,
    imageCover: tour.imageCover,
    images: tour.images || [],
    startDates: tour.startDates?.map(date => new Date(date).toISOString()) ?? [],
    startLocation: tour.startLocation,
    locations: tour.locations || [],
    isPublished: tour.isPublished,
    guides: tour.guides,
    schedules: (tour as any).schedules,
    createdBy: tour.createdBy,
    createdAt: tour.createdAt,
    updatedAt: tour.updatedAt,
  };
}
