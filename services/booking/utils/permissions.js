import AppError from './appError.js';
export default function checkPermissions(doc, user) {
  if (!doc) {
    throw new AppError('Document not found', 404);
  }
  if (!user || !user.id || !user._id) {
    throw new AppError('Not authenticated', 401);
  }

  const userId = user.id || user._id?.toString();
  const ownerId = doc.user?.toString();
  // Admin
  if (user.role === 'admin') return true;
  if (!ownerId) {
    throw new AppError('Resource has no owner field', 500);
  }
  if (ownerId !== userId) {
    throw new AppError('You do not have permission to access this resource', 403);
  }
  return true;
}
