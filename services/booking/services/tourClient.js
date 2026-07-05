import axios from 'axios';
const TOUR_API_BASE = process.env.TOUR_API_BASE || 'http://gateway:8080';
const TOUR_INTERNAL = process.env.TOUR_INTERNAL_TOKEN;

const client = axios.create({
  baseURL: `${TOUR_API_BASE}/api/v1/tours`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});
const internalHeaders = () => ({ 'x-internal-token': TOUR_INTERNAL });
export async function getTourById(tourId) {
  if (!tourId) {
    console.error('[tourClient] getTourById: Missing tourId');
    return null;
  }

  try {
    const res = await client.get(`/${tourId}`, { headers: internalHeaders() });
    return res.data?.data || res.data;
  } catch (err) {
    if (err.response?.status !== 404) {
      console.error(
        `[tourClient] Error fetching tour ${tourId}:`,
        err.response?.data || err.message,
      );
    }
    return null;
  }
}
export async function getTourSnapshot(tourId) {
  const tour = await getTourById(tourId);
  if (!tour) return null;
  return {
    name: tour.name || 'Unknown Tour',
    price: tour.price,
  };
}
