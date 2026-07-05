import axios from 'axios';
const BOOKING_API_BASE = process.env.BOOKING_API_BASE || 'http://gateway:8080'; // fallback
const BOOKING_INTERNAL = process.env.BOOKING_INTERNAL_TOKEN;

const client = axios.create({
  baseURL: `${BOOKING_API_BASE}/api/v1/bookings`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000, // 5 giây
});
const internalHeaders = () => ({ 'x-internal-token': BOOKING_INTERNAL });

export async function confirmBookingPayment(bookingId, payload = {}) {
  const url = `/${bookingId}/confirm-payment`;
  return client.patch(url, payload, { headers: internalHeaders() });
}
