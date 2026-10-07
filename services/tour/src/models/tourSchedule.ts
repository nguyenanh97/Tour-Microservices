import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configs/db';

export interface TourScheduleAttributes {
  id: number;
  tourId: number;
  startDate: string;
  price: number;
  maxGroupSize: number;
  bookedSeats: number;
  status: 'active' | 'full' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}
interface TourScheduleCreationAttributes extends Optional<
  TourScheduleAttributes,
  'id' | 'bookedSeats' | 'status' | 'createdAt' | 'updatedAt'
> {}
class TourSchedule
  extends Model<TourScheduleAttributes, TourScheduleCreationAttributes>
  implements TourScheduleAttributes
{
  public id!: number;
  public tourId!: number;
  public startDate!: string;
  public price!: number;
  public maxGroupSize!: number;
  public bookedSeats!: number;
  public status!: 'active' | 'full' | 'cancelled';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
TourSchedule.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    tourId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'tours',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    maxGroupSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bookedSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        //không vượt quá maxGroupSize,
        isNotOverCapacity(this: TourSchedule, value: number) {
          if (
            this.maxGroupSize !== undefined &&
            this.maxGroupSize !== null &&
            value > this.maxGroupSize
          ) {
            throw new Error('Booked seats cannot exceed max group size');
          }
        },
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'full', 'cancelled'),
      defaultValue: 'active',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'tour_schedules',
    timestamps: true,
    indexes: [
      { fields: ['startDate'] },
      { fields: ['status'] },

      //1 ngày chỉ 1 tour khởi hành
      { unique: true, fields: ['tourId', 'startDate'] },
    ],
  }
);

export default TourSchedule;
