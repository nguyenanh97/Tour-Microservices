import { ProfileAttributes } from '../models/profileModel';
import UserProfile from '../models/profileModel';

//Create Profile
export interface CreateProfileDto extends Omit<
  ProfileAttributes,
  'id' | 'role' | 'metadata' | 'deletedAt' | 'createdAt' | 'updatedAt' | 'isLive'
> {
  userId: string;
  name: string;
  age?: number;
  avatar?: string;
  phone?: string;
  address?: string;
  bio?: string;
}

// Update Profile Dto
export type UpdateProfileDto = Partial<Omit<CreateProfileDto, 'userId'>>;

// auth Internal Dto
export interface CreateProfileInternalDto extends Omit<
  ProfileAttributes,
  'id' | 'role' | 'metadata' | 'deletedAt' | 'createdAt' | 'updatedAt' | 'isLive'
> {
  userId: string; // Giữ lại userId bắt buộc
  name: string;
  email?: string;
}

//Response Profile
export interface ResponseProfileDto {
  id: number;
  userId: string;
  email?: string;
  name: string;
  age?: number;
  avatar?: string;
  phone?: string;
  address?: string;
  bio?: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mapper
export function toProfileResponseDto(profile: UserProfile): ResponseProfileDto {
  return {
    id: profile.id,
    userId: profile.userId,
    email: profile.email,
    name: profile.name,
    age: profile.age,
    avatar: profile.avatar,
    phone: profile.phone,
    address: profile.address,
    bio: profile.bio,
    role: profile.role,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}
