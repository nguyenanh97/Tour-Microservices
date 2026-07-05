import axios from 'axios';
const PAYMENT_API_BASE = process.env.PAYMENT_API_BASE || 'http://gateway:8080';
const PAYMENT_INTERNAL = process.env.PAYMENT_INTERNAL_TOKEN;

const client = axios.create({
  baseURL: `${PAYMENT_API_BASE}/api/v1/payments`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});
const internalHeaders = () => ({ 'x-internal-token': PAYMENT_INTERNAL });
export async function createCheckoutSession({
  bookingId,
  amount,
  currency = 'usd',
  userEmail,
  successUrl,
  cancelUrl,
}) {
  const res = await client.post(
    '/create-checkout-session',
    { bookingId, amount, currency, userEmail, successUrl, cancelUrl },
    { headers: internalHeaders() },
  );
  return res.data?.data || res.data;
}
