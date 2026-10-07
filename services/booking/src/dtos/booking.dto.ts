import Booking, {
  BookingAttributes,
  PaymentStatus,
  BookingStatus,
} from '../models/bookingModel';

// Create DTO
export interface CreateBookingDto extends Omit<
  BookingAttributes,
  | 'id'
  | 'userId'
  | 'pricePerGuest'
  | 'totalPrice'
  | 'status'
  | 'paymentStatus'
  | 'paymentIntentId'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
> {
  tourId: number;
  tourScheduleId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  numberOfGuests: number;
}
// Update DTO
export type UpdateBookingDto = Partial<CreateBookingDto>;

//Admin
export interface UpdateBookingAdminDto {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  paymentIntentId?: string;
}
// FilterQuery DTO
export interface FilterBookingQueryDto {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}
// Response
export interface ResponseBookingDto {
  id: number;
  userId: string;
  tourId: number;
  tourScheduleId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  numberOfGuests: number;
  pricePerGuest: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function toBookingResponseDto(booking: Booking): ResponseBookingDto {
  return {
    id: booking.id,
    userId: booking.userId,
    tourId: booking.tourId,
    tourScheduleId: booking.tourScheduleId,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    numberOfGuests: booking.numberOfGuests,
    // Ép kiểu các cột DECIMAL trong MySQL từ chuỗi (string) sang dạng số (number)
    pricePerGuest: Number(booking.pricePerGuest),
    totalPrice: Number(booking.totalPrice),
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    paymentIntentId: booking.paymentIntentId,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}
