import axios, { AxiosInstance, AxiosError } from 'axios';

const USER_API_BASE = process.env.USER_API_BASE;
if (!USER_API_BASE) {
  throw new Error('Missing USER_API_BASE environment variable');
}
const USER_INTERNAL = process.env.USER_INTERNAL_TOKEN;
if (!USER_INTERNAL) {
  throw new Error('Missing USER_INTERNAL_TOKEN environment variable');
}
// Axios Client
const client: AxiosInstance = axios.create({
  baseURL: `${USER_API_BASE}`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000, // 5 giây
});

// Internal Auth Headers
const internalHeaders = () => ({ 'x-internal-token': USER_INTERNAL });

/// INTERFACES
interface CreateProfileInputObject {
  userId: string | number;
  name: string;
  email?: string;
}
interface UserProfile {
  userId: string | number;
  name: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  status: number;
  data: T; // payload
}

// Error Normalizer

function normalizeError(error: AxiosError | any): Error {
  const message =
    error?.response?.data?.message || error?.message || 'User service unavailable';

  return new Error(`[UserService] ${message}`);
}

// Create User Profile
export async function createUserProfile(
  arg1: CreateProfileInputObject,
): Promise<ApiResponse<UserProfile>>;
export async function createUserProfile(
  arg1: string | number,
  name: string,
  email?: string,
): Promise<ApiResponse<UserProfile>>;

// Implementation
export async function createUserProfile(
  arg1: CreateProfileInputObject | string | number,
  name?: string,
  email?: string,
): Promise<ApiResponse<UserProfile>> {
  try {
    let payload: CreateProfileInputObject;
    if (typeof arg1 === 'object') {
      payload = {
        userId: arg1.userId,
        name: arg1.name,
        email: arg1.email,
      };
    } else {
      if (!name) {
        throw new Error('name is required');
      }
      payload = {
        userId: arg1,
        name,
        email,
      };
    }
    const resp = await client.post('/', payload, { headers: internalHeaders() });
    return resp.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

// Delete User Profile

export async function deleteUserProfile(
  userId: string | number,
): Promise<{ success: boolean }> {
  try {
    const url = `/${userId}`;
    const res = await client.delete(url, { headers: internalHeaders() });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
}
