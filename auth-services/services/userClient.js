import axios from 'axios';

const USER_API_BASE = process.env.USER_API_BASE || 'http://gateway:8080'; // fallback
const USER_INTERNAL = process.env.USER_INTERNAL_TOKEN;

const client = axios.create({
  baseURL: `${USER_API_BASE}/api/v1/users`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000, // 5 giây
});
const internalHeaders = () => ({ 'x-internal-token': USER_INTERNAL });

// Restore profile (PATCH /restore/:id)
export async function resToreMe(userId) {
  if (!userId) throw new Error('Missing userId');
  const url = `/restore/${userId}`;
  return client.patch(url, {}, { headers: internalHeaders() });
}

// Create User Profile
export async function createUserProfile(arg1, name, email) {
  const payload =
    typeof arg1 === 'object'
      ? { userId: arg1.userId, name: arg1.name, email: arg1.email }
      : { userId: arg1, name, email };
  if (!payload?.userId || !payload?.name)
    throw new Error('userId and name are required');
  const resp = await client.post('/', payload, { headers: internalHeaders() });
  return resp.data;
}

// Delete User Profile

export async function deleteUserProfile(userId) {
  if (!userId) throw new Error('Missing userId');
  const url = `/${userId}`;
  return client.delete(url, { headers: internalHeaders() });
}
