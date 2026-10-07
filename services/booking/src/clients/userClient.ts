import { AxiosInstance, AxiosError } from 'axios';
import axios from 'axios';

const USER_API_BASE = process.env.USER_API_BASE;
if (!USER_API_BASE) {
  throw new Error('Missing USER_API_BASE environment variable');
}
const USER_INTERNAL = process.env.USER_INTERNAL_TOKEN;
if (!USER_INTERNAL) {
  throw new Error('Missing USER_INTERNAL environment variable');
}

const client: AxiosInstance = axios.create({
  baseURL: `${USER_API_BASE}`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});
const internalHeaders = () => ({ 'x-internal-token': USER_INTERNAL });

// Interfaces
interface GetUserByIdRequest {
  userId: string | number;
}
interface User {
  userId: string | number;
  name: string;
  email: string;
}
interface ApiResponse<T> {
  status: string;
  data: T;
}

//Error Normalizer
function normalizer(error: AxiosError | any): Error {
  const message =
    error?.response?.data?.message || error?.message || 'User service unavailable';
  return new Error(`[UserService] ${message}`);
}

//
export async function getUserById({
  userId,
}: GetUserByIdRequest): Promise<any | null> {
  if (!userId) {
    console.error('[userClient] getUserById: Missing userId');
    return null;
  }

  try {
    const res = await client.get<ApiResponse<User>>(`/${userId}`, {
      headers: internalHeaders(),
    });
    return res.data?.data || res.data;
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.status !== 404) {
      console.error(
        `[userClient] Error fetching user ${userId}:`,
        error.response?.data || error.message,
      );
    }
    return null;
  }
}

export async function getUserSnapshot(userId: string) {
  const user = await getUserById({ userId });
  if (!user) return null;
  return {
    name: user.name || 'Unknown User',
    email: user.email,
  };
}
