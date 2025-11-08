import mongoose from 'mongoose';
import slugify from 'slugify';
import validator from 'validator';
//const userModel = require('../models/userModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must have  less or equal then 40 characters'],
      minlength: [5, 'A tour must have  more or equal then 10 characters'],
      //validator: [validator.isAlpha, 'A tour must have'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a Group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficlty'],
      enum: ['easy', 'medium', 'difficult'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.6,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Ratinf must be below 5.0'],
      set: val => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // Validator này chỉ hoạt động khi TẠO MỚI document, không hoạt động trên .update()
          // `this` ở đây sẽ trỏ tới document hiện tại
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description '],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image'],
    },
    images: [String],

    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  /// không lưu trữ vào DB
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//đặt index để  chuy vấn nhanh hơn

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: '2dsphere' });

//
tourSchema.virtual('durationWeeks').get(function () {
  if (!this.duration) return undefined;
  return this.duration / 7;
});

//DOCUMENT MIDDLEWARE .this (.save(),.create())

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

//
tourSchema.post(/^find/, function (docs, next) {
  if (this.start) {
    console.log(`Query took ${Date.now() - this.start}`);
  }
  next();
});

//AGGREGATION MIDDLEWARE .this

tourSchema.pre('aggregate', function (next) {
  const firstStage = this.pipeline()[0];
  if (firstStage && firstStage.$geoNear) {
    return next(); // Không thêm $match nếu đã có $geoNear đầu tiên
  }
  // Nếu không có $geoNear ở đầu, thêm $match như cũ
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
// tourSchema.pre('validate', function (next) {
//   console.log('VALIDATE DOC:', this);
//   next();
// });

const Tour = mongoose.models.Tour || mongoose.model('Tour', tourSchema);
export default Tour;
