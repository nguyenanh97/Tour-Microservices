import Payment, {
  PaymentAttributes,
  PaymentStatus,
  PaymentProvider,
} from '../models/paymentModel';

// Create DTO
export interface CreatePaymentDto extends Omit<
  PaymentAttributes,
  | 'id'
  | 'paymentId'
  | 'status'
  | 'paymentIntentId'
  | 'sessionId'
  | 'provider'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
> {
  sessionId?: string | null;
  provider?: PaymentProvider;
  meta?: Record<string, any> | null;
}
// Updete
export type UpdatePaymentDto = Partial<CreatePaymentDto>;

// Admin Update Status
export interface UpdatePaymentAdminDto {
  status?: PaymentStatus;
  paymentIntentId?: string;
}
// FilterQuery Dto
export interface FilterPaymentQueryDto {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}

// Response
export interface ResponsePaymentDto {
  id: number;
  paymentId: string;
  bookingId: string;
  provider: PaymentProvider;
  sessionId?: string | null;
  paymentIntentId?: string | null;
  amount: number;
  currency: string;
  customerEmail: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}
export function toPaymentResponseDto(payment: Payment): ResponsePaymentDto {
  return {
    id: payment.id,
    paymentId: payment.paymentId,
    bookingId: payment.bookingId,
    provider: payment.provider,
    sessionId: payment.sessionId,
    paymentIntentId: payment.paymentIntentId,
    amount: Number(payment.amount),
    currency: payment.currency,
    customerEmail: payment.customerEmail,
    status: payment.status,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}
