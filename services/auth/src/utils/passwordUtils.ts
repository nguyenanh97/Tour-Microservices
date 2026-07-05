import bcryptjs from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcryptjs.hash(password, 12);
};

export const comparePassword = async (
  candidatePassword: string,
  hashed: string,
): Promise<boolean> => {
  return await bcryptjs.compare(candidatePassword, hashed);
};
