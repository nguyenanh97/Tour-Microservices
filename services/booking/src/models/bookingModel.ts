import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export interface BookingAttributes {
  id: number;
  userId: string;
  tourId: number;
  tourScheduleId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  numberOfGuests: number;
  pricePerGuest: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string; // Mã giao dịch thanh toán (Stripe/PayPal...)
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
export interface BookingCreationAttributes extends Optional<
  BookingAttributes,
  | 'id'
  | 'customerPhone'
  | 'status'
  | 'paymentStatus'
  | 'paymentIntentId'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
> {}

class Booking
  extends Model<BookingAttributes, BookingCreationAttributes>
  implements BookingAttributes
{
  public id!: number;
  public userId!: string;
  public tourScheduleId!: number;
  public tourId!: number;
  public customerName!: string;
  public customerEmail!: string;
  public customerPhone?: string;
  public numberOfGuests!: number;
  public pricePerGuest!: number;
  public totalPrice!: number;
  public status!: BookingStatus;
  public paymentIntentId!: string;
  public paymentStatus!: PaymentStatus;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

//
Booking.init(
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
    tourScheduleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    tourId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    customerEmail: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { isEmail: true },
    },
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    numberOfGuests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    pricePerGuest: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'refunded'),
      defaultValue: 'pending',
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
      allowNull: false,
    },
    paymentIntentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'bookings',
    timestamps: true,
    paranoid: true,
  },
);
export default Booking;
