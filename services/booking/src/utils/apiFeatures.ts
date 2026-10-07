import { FindOptions, Op, OrderItem } from 'sequelize';

type QueryString = {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
};
class APIFeatures<T extends object> {
  private options: FindOptions<T>;
  private queryString: QueryString;
  constructor(queryString: QueryString) {
    this.queryString = queryString;
    this.options = {
      where: {},
    };
  }
  filter(): this {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    const where: any = {};

    Object.keys(queryObj).forEach(key => {
      const value = queryObj[key];
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Xử lý toán tử: ?price[gte]=100&price[lte]=500
          const fieldOperators: any = {};
          Object.keys(value).forEach(op => {
            const val = value[op];
            const numVal = Number(val);
            const parsedVal =
              !isNaN(numVal) && String(val).trim() !== '' ? numVal : val;

            if (op === 'gte') fieldOperators[Op.gte] = parsedVal;
            else if (op === 'gt') fieldOperators[Op.gt] = parsedVal;
            else if (op === 'lte') fieldOperators[Op.lte] = parsedVal;
            else if (op === 'lt') fieldOperators[Op.lt] = parsedVal;
            else if (op === 'eq') fieldOperators[Op.eq] = parsedVal;
            else if (op === 'ne') fieldOperators[Op.ne] = parsedVal;
          });
          if (Object.keys(fieldOperators).length > 0) {
            where[key] = fieldOperators;
          }
        } else {
          // Xử lý so sánh bằng: ?difficulty=easy hoặc ?price=100
          const numVal = Number(value);
          const isNum = !isNaN(numVal) && String(value).trim() !== '';
          where[key] = isNum ? numVal : value;
        }
      }
    });

    this.options.where = { ...(this.options.where || {}), ...where };
    return this;
  }

  // sort
  sort(): this {
    if (this.queryString.sort) {
      const order: OrderItem[] = this.queryString.sort.split(',').map(field => {
        const trimmed = field.trim();
        if (trimmed.startsWith('-')) {
          return [trimmed.slice(1), 'DESC'];
        }
        return [trimmed, 'ASC'];
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
      const fields = this.queryString.fields.split(',').map(f => f.trim());
      this.options.attributes = fields;
    } else {
      this.options.attributes = { exclude: ['deletedAt'] };
    }
    return this;
  }
  //pagination
  paginate(defaultlimit = 10, maxLimit = 100): this {
    const page = Math.max(1, parseInt(this.queryString.page || '1', 10));
    let limit = parseInt(this.queryString.limit || String(defaultlimit), 10);
    limit = Math.max(1, Math.min(maxLimit, isNaN(limit) ? defaultlimit : limit));
    this.options.limit = limit;
    this.options.offset = (page - 1) * limit;
    return this;
  }
  getOptions(): FindOptions<T> {
    return this.options;
  }

  getPaginationMetadata(totalCount: number) {
    const page = Math.max(1, parseInt(this.queryString.page || '1', 10));
    const limit = this.options.limit || 10;
    return {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }
}

export default APIFeatures;
