import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/db';

// Interface for User attributes
export interface ProfileAttributes {
  id: number;
  userId: string;
  email?: string;
  name: string;
  age?: number;
  avatar?: string;
  phone?: string;
  address?: string;
  bio?: string;
  role?: 'admin' | 'user';
  metadata?: object;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  isLive: boolean;
}
// interface  creation(id,optional)
export interface ProfileCreationAttributes extends Optional<
  ProfileAttributes,
  | 'id'
  | 'email'
  | 'age'
  | 'deletedAt'
  | 'avatar'
  | 'phone'
  | 'address'
  | 'bio'
  | 'role'
  | 'metadata'
  | 'createdAt'
  | 'updatedAt'
  | 'isLive'
> {}

//  Class User extends Model
class UserProfile
  extends Model<ProfileAttributes, ProfileCreationAttributes>
  implements ProfileAttributes
{
  public id!: number;
  public userId!: string;
  public name!: string;
  public email?: string;
  public role?: 'admin' | 'user';
  public age?: number;
  public avatar?: string;
  public phone?: string;
  public address?: string;
  public bio?: string;
  public metadata?: object;
  public deletedAt?: Date | null;
  public isLive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
UserProfile.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isLive: { type: DataTypes.BOOLEAN, defaultValue: true },

    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    bio: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
    },

    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'user_profiles',
    timestamps: true,
    paranoid: true,
    deletedAt: 'deletedAt',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'isLive'], //đảm bảo chỉ 1 profile live cho mỗi userId
      },
    ],
  },
);
UserProfile.afterCreate(async (user: UserProfile) => {
  console.log(`User created: ${user.userId}`);
});

export default UserProfile;
