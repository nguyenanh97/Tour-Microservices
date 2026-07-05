import axios from 'axios';

const USER_API_BASE = process.env.USER_API_BASE || 'http://gateway:8080';
const USER_INTERNAL = process.env.USER_INTERNAL_TOKEN;

const client = axios.create({
  baseURL: `${USER_API_BASE}/api/v1/users`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});
const internalHeaders = () => ({ 'x-internal-token': USER_INTERNAL });

export async function getUserById(userId) {
  if (!userId) {
    console.error('[userClient] getUserById: Missing userId');
    return null;
  }

  try {
    const res = await client.get(`/${userId}`, { headers: internalHeaders() });
    return res.data?.data || res.data;
  } catch (err) {
    if (err.response?.status !== 404) {
      console.error(
        `[userClient] Error fetching user ${userId}:`,
        err.response?.data || err.message,
      );
    }
    return null;
  }
}

export async function getUserSnapshot(userId) {
  const user = await getUserById(userId);
  if (!user) return null;
  return {
    name: user.name || 'Unknown User',
    email: user.email,
  };
}
