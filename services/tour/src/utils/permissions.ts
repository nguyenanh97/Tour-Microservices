import AppError from './appError';
export default function checkPermissions(doc, user) {
  const isAdmin = user.role === 'admin';

  if (!isAdmin) {
    throw new AppError('Only admins are allowed to manipulate this resource..', 403);
  }
}
