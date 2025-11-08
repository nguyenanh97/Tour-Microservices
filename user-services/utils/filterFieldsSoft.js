export default function filterFieldsSoft(obj = {}, allowedFields = []) {
  if (!obj || typeof obj !== 'object') return {};

  const filtered = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      filtered[key] = obj[key];
    }
  });
  return filtered;
}
