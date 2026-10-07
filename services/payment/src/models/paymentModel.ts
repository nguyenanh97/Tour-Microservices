import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

export type PaymentStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type PaymentProvider = 'stripe' | 'paypal' | 'vnpay' | 'momo' | string;

export interface PaymentAttributes {
  id: number;
  paymentId: string;
  bookingId: string;
  provider?: PaymentProvider;
  sessionId?: string | null;
  paymentIntentId?: string | null;
  amount: number;
  currency: string;
  customerEmail: string;
  status: PaymentStatus;
  paymentMethod?: string | null;
  meta?: Record<string, any> | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface PaymentCreationAttributes extends Optional<
  PaymentAttributes,
  | 'id'
  | 'paymentId'
  | 'provider'
  | 'sessionId'
  | 'paymentIntentId'
  | 'paymentMethod'
  | 'status'
  | 'currency'
  | 'meta'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
> {}

class Payment
  extends Model<PaymentAttributes, PaymentCreationAttributes>
  implements PaymentAttributes
{
  public id!: number;
  public paymentId!: string;
  public bookingId!: string;
  public provider!: PaymentProvider;
  public sessionId?: string | null;
  public paymentIntentId?: string | null;
  public amount!: number;
  public currency!: string;
  public customerEmail!: string;
  public status!: PaymentStatus;
  public paymentMethod?: string | null;
  public meta?: Record<string, any> | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    paymentId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    bookingId: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'stripe',
    },
    sessionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    paymentIntentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'USD',
    },
    customerEmail: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'succeeded',
        'failed',
        'refunded',
        'cancelled',
      ),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    meta: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'payments',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: 'idx_payments_payment_id',
        unique: true,
        fields: ['paymentId'],
      },
      {
        name: 'idx_payments_session_id',
        fields: ['sessionId'],
      },
      {
        name: 'idx_payments_payment_intent_id',
        fields: ['paymentIntentId'],
      },
      {
        name: 'idx_payments_booking_id',
        fields: ['bookingId'],
      },
      {
        name: 'idx_payments_customer_email',
        fields: ['customerEmail'],
      },
      {
        name: 'idx_payments_status',
        fields: ['status'],
      },
    ],
  },
);

export default Payment;
