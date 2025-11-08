import Tour from '../models/tourModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import {
  createOne,
  getOne,
  updateOne,
  deleteOne,
  getAll,
  getStats,
  getMonth,
} from './handlerFactory.js';

import {
  MILES_PER_METER,
  KM_PER_METER,
  EARTH_RADIUS_MILES,
  EARTH_RADIUS_KM,
} from '../utils/constant.js';

// POST (Create New Tour)
export const createTour = createOne(Tour);

/// PATCH ID (Update Tour)
export const updateTour = updateOne(Tour, { adminOnly: true });

// Delete TestTour
export const deleteTour = deleteOne(Tour);

//GET

export const getAllTours = getAll(Tour);
export const getTourID = getOne(Tour);

//  :  thực hiện các phép tính tổng hợp nâng cao của chuy vấn đên db
export const getTourStats = getStats(Tour);
// GET MONTH
export const getMonthlyPlan = getMonth(Tour);

//35.03826883498337, 137.1042728287075
export const getTourWithin = catchAsync(async (req, res, next) => {
  const { distance: distanceStr, latlng, unit } = req.params;
  if (!latlng || !unit) {
    return next(new AppError('Please provide latlng and unit', 400));
  }
  // Validate và chuyển đổi distance thành số
  const distance = parseFloat(distanceStr);
  if (isNaN(distance)) {
    return next(new AppError('Distance must be a number', 400));
  }
  // Validate và parse tọa độ
  const [lat, lng] = latlng.split(',').map(coord => parseFloat(coord));

  if (isNaN(lat) || isNaN(lng)) {
    return next(new AppError('Latitude and longitude must be numbers', 400));
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    // Validate phạm vi tọa độ
    return next(
      new AppError(
        'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.',
        400
      )
    );
  }

  // Chuyển đổi khoảng cách sang radians
  const radius =
    unit === 'mi' ? distance / EARTH_RADIUS_MILES : distance / EARTH_RADIUS_KM;

  try {
    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  } catch (error) {
    // Xử lý lỗi cụ thể từ MongoDB Geo queries
    if (error.code === 2) {
      return next(new AppError('Invalid coordinates for geospatial query', 400));
    }
    throw error; // Ném lại lỗi khác để global error handler xử lý
  }
});

// handl tours cheap
export const getTopcheap = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,summary,description';
  next();
};
//
export const getDistancens = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  // Validate và parse tọa độ
  const [lat, lng] = latlng.split(',').map(coord => parseFloat(coord));
  const multiplier = unit === 'mi' ? MILES_PER_METER : KM_PER_METER;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    { $project: { distance: 1, name: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: { data: distances },
  });
});
