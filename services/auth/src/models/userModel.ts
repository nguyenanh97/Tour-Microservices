import { DataTypes, Model, Optional } from 'sequelize';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { generateToken } from '../tokens/tokenUtils';
import validator from 'validator';
import sequelize from '../configs/db';

// Interface for User attributes(thuộc tính)
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guide' | 'lead-guide';
  password: string;
  active: boolean;

  passwordChangedAt?: Date;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;

  verified: boolean;
  verifyToken?: string | null;
  verifyTokenExpires?: Date | null;

  restoreToken?: string | null;
  restoreTokenExpires?: Date | null;

  resendVerifyAt?: Date | null;
  resendVerifyCount?: number | null;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;

  emailOriginal?: string;
}
// interface  creation(id,optional)
interface UserCreationAttributes extends Optional<
  UserAttributes,
  | 'id'
  | 'role'
  | 'passwordChangedAt'
  | 'passwordResetToken'
  | 'passwordResetExpires'
  | 'verifyToken'
  | 'verifyTokenExpires'
  | 'restoreToken'
  | 'restoreTokenExpires'
  | 'resendVerifyAt'
  | 'resendVerifyCount'
  | 'verified'
  | 'deletedAt'
  | 'emailOriginal'
  | 'active'
> {}

//  Class User extends Model
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public role!: 'admin' | 'user' | 'guide' | 'lead-guide';

  public password!: string;
  public passwordChangedAt!: Date;
  public passwordResetToken!: string | null;
  public passwordResetExpires!: Date | null;

  public verified!: boolean;
  public verifyToken!: string | null;
  public verifyTokenExpires!: Date | null;

  public restoreToken!: string | null;
  public restoreTokenExpires!: Date | null;
  public resendVerifyAt?: Date | null;
  public resendVerifyCount?: number | null;

  public active!: boolean;
  public deletedAt?: Date | null;
  public emailOriginal?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public async correctPassword(candidatePassword: string): Promise<boolean> {
    return comparePassword(candidatePassword, this.password);
  }
  public changedPasswordAfter(JWTTimestamp: number): boolean {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000 + '',
        10,
      );
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  }
  public generateTokenAndSetFields(
    hashedField: keyof UserAttributes,
    expiresField: keyof UserAttributes,
    expiresInMs = 60 * 60 * 1000,
  ): string {
    const { rawToken, hashedToken, expiresAt } = generateToken(expiresInMs);
    (this as Record<string, any>)[hashedField] = hashedToken.slice(0, 255);
    (this as Record<string, any>)[expiresField] = expiresAt;
    return rawToken;
  }
  public createEmailVerifyToken(): string {
    return this.generateTokenAndSetFields('verifyToken', 'verifyTokenExpires');
  }
  public createRestoreToken(): string {
    return this.generateTokenAndSetFields('restoreToken', 'restoreTokenExpires');
  }
  public createPasswordResetToken(): string {
    return this.generateTokenAndSetFields(
      'passwordResetToken',
      'passwordResetExpires',
    );
  }
}

// Init Model
User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    role: {
      type: DataTypes.ENUM('admin', 'user', 'guide', 'lead-guide'),
      defaultValue: 'user',
      allowNull: false,
    },

    password: { type: DataTypes.STRING(255), allowNull: false },
    passwordChangedAt: { type: DataTypes.DATE, allowNull: true },
    passwordResetToken: { type: DataTypes.STRING(255), allowNull: true },
    passwordResetExpires: { type: DataTypes.DATE, allowNull: true },

    verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verifyToken: { type: DataTypes.STRING(64), allowNull: true },
    verifyTokenExpires: { type: DataTypes.DATE, allowNull: true },

    restoreToken: { type: DataTypes.STRING(255), allowNull: true },
    restoreTokenExpires: { type: DataTypes.DATE, allowNull: true },
    resendVerifyAt: { type: DataTypes.DATE, allowNull: true },
    resendVerifyCount: { type: DataTypes.INTEGER, defaultValue: 0 },

    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    deletedAt: { type: DataTypes.DATE, allowNull: true },
    emailOriginal: { type: DataTypes.STRING(255), allowNull: false },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'Auth',
    timestamps: true,
    indexes: [{ fields: ['emailOriginal'] }],

    // soft delete
    paranoid: true,
    deletedAt: 'deletedAt',
    defaultScope: {
      where: {},
      attributes: {
        exclude: ['password', 'verifyToken', 'passwordResetToken', 'restoreToken'],
      },
    },
    scopes: {
      withPassword: {
        attributes: {
          exclude: [],
        },
      },
    },
  },
);

// Hook to normalize email before validation
User.beforeValidate(user => {
  if (typeof user.email === 'string' && user.email.length > 0) {
    if (user.email.includes('#deleted#')) return;
    const raw = validator.normalizeEmail(user.email, { gmail_remove_dots: false });
    const normalized = String(raw || user.email)
      .trim()
      .toLowerCase();
    user.email = normalized;
    user.emailOriginal = normalized;
  }
  if (
    !user.emailOriginal &&
    typeof user.email === 'string' &&
    user.email.length > 0
  ) {
    user.emailOriginal = user.email.includes('#deleted#')
      ? String(user.email).split('#deleted#')[0].trim().toLowerCase()
      : String(user.email).trim().toLowerCase();
  }
});

// Hook to hash password before saving
User.beforeCreate(async user => {
  user.password = await hashPassword(user.password);
});
User.beforeUpdate(async user => {
  if (user.changed('password')) {
    user.password = await hashPassword(user.password);
    user.passwordChangedAt = new Date();
  }
});
export default User;
