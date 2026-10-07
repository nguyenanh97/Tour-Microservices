import { Tour, TourSchedule } from '../models';

// DTO Create
export interface CreateScheduleDto {
  startDate: string;
  price: number;
  maxGroupSize: number;
  status?: 'active' | 'full' | 'cancelled';
  bookedSeats?: number;
}

// DTO Update
export type UpdateScheduleDto = Partial<CreateScheduleDto>;

// // FilterQuery DTO
// export interface FilterScheduleQueryDto {
//   limit?: number;
//   sort?: string;
//   fields?: string;
//   status?: 'active' | 'full' | 'cancelled';
//   price?: number;
//   startDate?: string;
// }

// DTO Response
export interface ResponseScheduleDto {
  id: number;
  tourId: number;
  startDate: string;
  price: number;
  maxGroupSize: number;
  bookedSeats: number;
  status: 'active' | 'full' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
//Hàm chuyển đổi Model sang DTO (Mapper)
export function toTourScheduleDto(schedule: TourSchedule): ResponseScheduleDto {
  return {
    id: schedule.id,
    tourId: schedule.tourId,
    startDate: schedule.startDate,
    price: schedule.price,
    maxGroupSize: schedule.maxGroupSize,
    bookedSeats: schedule.bookedSeats,
    status: schedule.status,
    createdAt: schedule.createdAt,
    updatedAt: schedule.updatedAt,
  };
}
