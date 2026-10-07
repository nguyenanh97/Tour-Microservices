export default function filterFieldsSoft<T extends object>(
  obj: Partial<T> = {},
  allowedFields: (keyof T)[] = [],
): Partial<T> {
  if (!obj || typeof obj !== 'object') return {};
  const filtered: Partial<T> = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key as keyof T)) {
      filtered[key as keyof T] = obj[key as keyof T];
    }
  });
  return filtered;
}
