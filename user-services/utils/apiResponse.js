export const sendResponse = {
  success: (res, data, statusCode = 200, status = 'success') => {
    res.status(statusCode).json({
      status,
      data,
    });
  },
  list: (res, docs, statusCode = 200) => {
    res.status(statusCode).json({
      status,
      result: docs.length,
      data: { data: docs },
    });
  },
  create: (res, docs) => {
    return res.status(201).json({
      status: 'success',
      data: { docs },
    });
  },
};
