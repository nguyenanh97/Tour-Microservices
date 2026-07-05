import { DataTypes, Model, Optional } from 'sequelize';
import slugify from 'slugify';
import sequelize from '../configs/db';

// Interface for Tour attributes(thuộc tính)

export interface TourAttributes {
  id: number;
  name: string;

  slug: string;
  duration: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'medium' | 'difficult';

  ratingsAverage: number;
  ratingsQuantity: number;

  price: number;
  priceDiscount?: number;

  summary: string;

  description?: string;

  imageCover: string;
  images?: string[];

  createdAt?: Date;
  deletedAt?: Date | null;
  updatedAt?: Date;

  startDates?: Date[];

  startLocation?: object; // GeoJSON
  locations?: object[];

  isPublished: boolean;
  createdBy?: number; // User ID

  guides?: number[]; // Array of User IDs
}

// interface  creation(optional)

interface TourCreationAttributes extends Optional<
  TourAttributes,
  | 'slug'
  | 'ratingsAverage'
  | 'ratingsQuantity'
  | 'description'
  | 'images'
  | 'createdAt'
  | 'deletedAt'
  | 'startDates'
  | 'startLocation'
  | 'locations'
  | 'createdBy'
  | 'guides'
> {}

//  Class Tour extends Model
class Tour
  extends Model<TourAttributes, TourCreationAttributes>
  implements TourAttributes
{
  public id!: number;
  public name!: string;
  public slug!: string;
  public duration!: number;
  public maxGroupSize!: number;
  public difficulty!: 'easy' | 'medium' | 'difficult';
  public ratingsAverage!: number;
  public ratingsQuantity!: number;
  public price!: number;
  public priceDiscount?: number;
  public summary!: string;
  public description?: string;
  public imageCover!: string;
  public images?: string[];

  public startLocation?: object;
  public locations?: object[];
  public guides!: number[];

  public startDates?: Date[];
  public createdBy?: number;
  public isPublished!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // virtual field
  get durationWeeks(): number {
    return this.duration / 7;
  }
}

Tour.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    slug: { type: DataTypes.STRING },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    maxGroupSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'difficult'),
      allowNull: false,
    },
    ratingsAverage: {
      type: DataTypes.FLOAT,
      defaultValue: 4.6,
    },
    ratingsQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    guides: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    priceDiscount: {
      type: DataTypes.FLOAT,
      validate: {
        isLessThanPrice(this: Tour, value: number) {
          if (value >= this.price) {
            throw new Error('Discount price should be below regular price');
          }
        },
      },
    },

    summary: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    imageCover: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    startDates: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    startLocation: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    locations: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'Tour',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['isPublished'] },
      { fields: ['deletedAt'] },
      { unique: true, fields: ['slug'] },
      { fields: ['price'] },
      { fields: ['ratingsAverage'] },
    ],
  }
);
// Hook
Tour.beforeCreate(tour => {
  tour.slug = slugify(tour.name, { lower: true });
});
Tour.beforeUpdate(tour => {
  if (tour.changed('name')) {
    tour.slug = slugify(tour.name, { lower: true });
  }
});

export default Tour;
