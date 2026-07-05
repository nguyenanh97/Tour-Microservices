import { FindOptions, Op, OrderItem } from 'sequelize';
import { TourAttributes } from '../models/tourModel';

type QueryString = {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  price?: string;
  duration?: string;
  difficulty?: TourAttributes['difficulty'];
  ratingsAverage?: string;
  ratingAverage?: string;

  [key: string]: string | undefined;
};
class APIFeatures {
  private options: FindOptions<TourAttributes>;
  private queryString: QueryString;
  constructor(queryString: QueryString) {
    this.queryString = queryString;
    this.options = {
      where: {
        deletedAt: null,
      },
    };
  }
  filter(): this {
    const where: any = this.options.where ?? {};

    if (this.queryString.price) {
      where.price = { [Op.gte]: Number(this.queryString.price) };
    }

    if (this.queryString.duration) {
      where.duration = Number(this.queryString.duration);
    }

    if (this.queryString.difficulty) {
      where.difficulty = this.queryString.difficulty;
    }
    const ra = this.queryString.ratingsAverage ?? this.queryString.ratingAverage;
    if (ra) {
      where.ratingsAverage = { [Op.gte]: Number(ra) };
    }
    this.options.where = where;
    return this;
  }

  // sort
  sort(): this {
    if (this.queryString.sort) {
      const order: OrderItem[] = this.queryString.sort.split(',').map(field => {
        if (field.startsWith('-')) {
          return [field.slice(1), 'DESC'];
        }
        return [field, 'ASC'];
      });
      this.options.order = order;
    } else {
      this.options.order = [['createdAt', 'DESC']];
    }
    return this;
  }

  // limit fields
  limitFields(): this {
    if (this.queryString.fields) {
      this.options.attributes = this.queryString.fields.split(',');
    } else {
      this.options.attributes = { exclude: ['deletedAt'] };
    }
    return this;
  }
  //pagination
  paginate(): this {
    const page = parseInt(this.queryString.page || '1', 10);
    const limit = parseInt(this.queryString.limit || '100', 10);
    this.options.limit = limit;
    this.options.offset = (page - 1) * limit;
    return this;
  }
  getOptions(): FindOptions<TourAttributes> {
    return this.options;
  }
}

export default APIFeatures;
