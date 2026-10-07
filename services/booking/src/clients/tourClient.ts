import { AxiosInstance, AxiosError } from 'axios';
import axios from 'axios';
import AppError from '../utils/appError';
const TOUR_API_BASE = process.env.TOUR_API_BASE;
if (!TOUR_API_BASE) {
  throw new Error('Missing TOUR_API_BASE environment variable');
}
const TOUR_INTERNAL = process.env.TOUR_INTERNAL_TOKEN;
if (!TOUR_INTERNAL) {
  throw new Error('Missing TOUR_INTERNAL_TOKEN environment variable');
}
const client: AxiosInstance = axios.create({
  baseURL: `${TOUR_API_BASE}`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});
const internalHeaders = () => ({ 'x-internal-token': TOUR_INTERNAL });

// Interfaces

export interface TourScheduleDetail {
  id: number;
  startDate: Date;
  price: number;
  maxGroupSize: number;
  bookedSeats: number;
  numberOfGuests: number;
}
export interface TourDetail {
  id: number;
  name: string;
  price: number;
  schedules?: TourScheduleDetail[]; // Khai báo rõ ràng mảng Lịch trình ở đây
}

interface GetTourByIdRequest {
  tourId: string | number;
}
interface Tour {
  tourId: string | number;

  name: string;
  price: number;
}
interface ApiResponse<T> {
  status: string;
  data: T; // payload
}

// Error Normalizer

// function normalizeError(error: AxiosError | any): Error {
//   const message =
//     error?.response?.data?.message || error?.message || 'Tour service unavailable';

//   return new Error(`[TourService] ${message}`);
// }

// Get
export async function getTourById({
  tourId,
}: GetTourByIdRequest): Promise<TourDetail | null> {
  if (!tourId) {
    console.error('[tourClient] getTourById: Missing tourId');
    return null;
  }

  try {
    const res = await client.get<ApiResponse<TourDetail>>(`/${tourId}`, {
      headers: internalHeaders(),
    });
    return res.data?.data || res.data;
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.status !== 404) {
      console.error(
        `[tourClient] Error fetching tour ${tourId}:`,
        error.response?.data || error.message,
      );
    }
    return null;
  }
}
// SnapShot
export async function getTourSnapshot(tourId: string) {
  const tour = await getTourById({ tourId });
  if (!tour) return null;
  return {
    name: tour.name || 'Unknown Tour',
    price: tour.price,
  };
}

// BookedSeats
export async function scheduleSeats({
  scheduleId,
  numberOfGuests,
}: {
  scheduleId: number;
  numberOfGuests: number;
}): Promise<TourScheduleDetail> {
  try {
    const res = await client.patch<ApiResponse<{ data: TourScheduleDetail }>>(
      `/schedule/${scheduleId}/seats`,
      { numberOfGuests },
      { headers: internalHeaders() },
    );
    return (res.data?.data as any)?.data || res.data?.data;
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      'Failed to adjust tour schedule seats';
    const statusCode = err?.response?.status || 500;
    throw new AppError(message, statusCode);
  }
}
