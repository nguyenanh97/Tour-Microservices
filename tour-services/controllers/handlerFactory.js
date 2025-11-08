import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';
import filterFields from '../utils/filterFields.js';
import logger from '../utils/logger.js';
import permissions from '../utils/permissions.js'; // quyền sở hữu
import mongoose from 'mongoose';

/// POST
export const createOne = (Model, options = {}) =>
  catchAsync(async (req, res, next) => {
    // Nếu yêu cầu phải login
    if (options.protect && !req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Tự động set createdBy nếu bật option
    if (options.createdBy && req.user) {
      req.body.createdBy = req.user.id;
    }

    // Xử lý nested routes

    // test DEBUG
    // kiểm tra các required fields
    const payload = {
      name: req.body.name,
      price: req.body.price,
      duration: req.body.duration,
      difficulty: req.body.difficulty,
      maxGroupSize: req.body.maxGroupSize,
      summary: req.body.summary,
      description: req.body.description,
      imageCover: req.body.imageCover,
      images: req.body.images,
      startDates: req.body.startDates,
      secretTour: req.body.secretTour,
      startLocation: req.body.startLocation,
      locations: req.body.locations,
      guides: req.body.guides,
    };
    // Created lưu vào DB
    if (Model.schema.path('createdBy') && req.user && req.user.id) {
      payload.createdBy = req.user.id;
    }

    // 2) Clone sâu để đảm bảo là POJO sạch (loại prototype lạ)
    const cleanPayload = JSON.parse(JSON.stringify(payload));

    // Guard: nếu vì lý do gì đó body rỗng → báo lỗi sớm
    if (!cleanPayload || Object.keys(cleanPayload).length === 0) {
      return next(new AppError('Request body is empty', 400));
    }

    // Tạo document
    const doc = await Model.create(cleanPayload);

    // mở rộng nếu cần

    if (typeof options.onCreated === 'function') {
      try {
        await options.onCreated(req, doc); // gọi callback nếu có
      } catch (err) {
        logger.error(`onCreated hook failed for ${Model.modelName}:`, err);
      }
    }

    res.status(201).json({
      status: 'success',
      data: { doc },
    });
  });

/// Get ID
export const getOne = (Model, options = {}) =>
  catchAsync(async (req, res, next) => {
    const {
      populateOptions = null,
      select = null,
      userRestricted = false,
    } = options;

    // 1. Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError(`Invalid ID format`, 400));
    }

    // 2. Build query
    let query = Model.findById(req.params.id);
    if (options.select) {
      query = query.select(options.select);
    }
    if (Array.isArray(populateOptions)) {
      populateOptions.forEach(opt => (query = query.populate(opt)));
    } else if (populateOptions) {
      query = query.populate(populateOptions);
    }

    const doc = await query;

    // 3. Not found
    if (!doc) {
      return next(new AppError(`No ${Model.modelName} found with that ID`, 404));
    }
    // 4. Permission check (optional)
    if (userRestricted && req.user.role !== 'admin') {
      if (doc.user?.toString() !== req.user?.id) {
        return next(
          new AppError('You do not have permission to view this resource', 403)
        );
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

//
export const getAll = (Model, searchField = null, populateOptions = []) =>
  catchAsync(async (req, res, next) => {
    const filter = {};
    if (req.user.role !== 'admin' && Model.schema.path('createdBy')) {
      filter.createdBy = req.user.id;
    }

    // 2. Lọc theo nested param như :tourId → { tour: req.params.tourId }
    for (const key in req.params) {
      if (key.endsWith('Id')) {
        const fieldId = key.slice(0, -2);
        filter[fieldId] = req.params[key];
      }
    }

    // Build query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Populate if needed
    populateOptions.forEach(opt => {
      features.query = features.query.populate(opt);
    });
    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

// PATCH
export const updateOne = (Model, options = {}) =>
  catchAsync(async (req, res, next) => {
    const {
      allowedFields = [],
      adminOnly = false,
      requireOwnership = false,
    } = options;

    // Chỉ admin được update nếu bật adminOnly
    if (adminOnly && req.user.role !== 'admin') {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    //validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError('Invalid ID format', 400));
    }

    // 1. Lọc các trường được phép cập nhật
    if (allowedFields.length > 0) {
      req.body = filterFields(req.body, allowedFields);
    }

    //xoá thủ công user khỏi body, kể cả khi đã lọc
    delete req.body.user;
    delete req.body.createdBy;
    // 2. Tìm tài liệu
    let query = Model.findById(req.params.id);

    if (requireOwnership) query = query.select('+user');
    const doc = await query;
    if (!doc) {
      return next(new AppError(`No ${Model.modelName} found with that ID`, 404));
    }
    // check sở hữu
    if (requireOwnership && doc.user) {
      try {
        permissions(doc, req.user);
      } catch (err) {
        return next(err);
      }
    }

    //logger
    logger.info(
      `User ${req.user.id} (${req.user.role}) updated ${Model.modelName} ${doc._id}`
    );

    // 4. Cập nhật
    doc.set(req.body);
    await doc.save();
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

//

// DELETE
export const deleteOne = (Model, options = {}) =>
  catchAsync(async (req, res, next) => {
    const { adminOnly = false } = options;
    // Kiểm tra user đã xác thực
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError('Invalid ID format', 400));
    }
    //

    //Tìm document
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      return next(new AppError(`No ${Model.modelName} found with that ID `, 404));
    }

    // Kiểm tra quyền
    if (adminOnly && req.user.role !== 'admin') {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    try {
      permissions(doc, req.user);
    } catch (err) {
      return next(err);
    }
    //  Logging chi tiết
    // const ownerInfo = doc.user ? ` of user ${doc.user.toString()}` : '';
    // logger.info(
    //   `User ${req.user.id} (${req.user.role}) deleted ${Model.modelName} ${doc._id}`
    // );

    //Xóa document
    await doc.deleteOne();
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

export const getStats = Model =>
  catchAsync(async (req, res, next) => {
    const stats = await Model.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          agvRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  });

//
export const getMonth = Model =>
  catchAsync(async (req, res, next) => {
    const year = parseInt(req.params.year);
    const plan = await Model.aggregate([
      {
        $unwind: '$startDates', // []=>el1,el2
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      //_id => name
      { $addFields: { month: '$_id' } },

      //delete _id
      {
        $project: {
          _id: 0,
        },
      },
      //10--1
      {
        $sort: {
          numTourStarts: -1,
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      result: plan.length,
      data: {
        data: plan,
      },
    });
  });
