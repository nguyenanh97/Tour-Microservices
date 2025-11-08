import mongoose from 'mongoose';
import crypto from 'crypto';

import bcryptjs from 'bcryptjs';
import hashToken from '../utils/hashToken.js';

//skima
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/,
      'Please fill a valid email address',
    ],
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password !'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password '],
    select: false,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same !',
    },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verifyToken: String,
  verifyTokenExpires: Date,

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  restoreToken: String,
  restoreTokenExpires: Date,

  resendVerifyAt: Date,
  resendVerifyCount: {
    type: Number,
    default: 0,
  },

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//  loại bỏ các trường không cần thiết
userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.__v;
    delete ret.passwordConfirm;
    delete ret.passwordChangedAt;
    delete ret.verifyToken;
    delete ret.password;
    delete ret.verifyTokenExpires;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.restoreToken;
    delete ret.restoreTokenExpires;
    delete ret.resendVerifyAt;
    delete ret.resendVerifyCount;
    return ret;
  },
});

userSchema.pre('save', async function (next) {
  // kiểm tra mật khẩu có thay đổi k
  if (!this.isModified('password')) return next();

  // mã hoá mật khẩu
  this.password = await bcryptjs.hash(this.password, 12);

  // loại bỏ mật xác nhận
  this.passwordConfirm = undefined;
  //this.passwordChangedAt = Date.now() - 1000;
  next();
});

//

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// lọc dữ liệu của active

userSchema.pre(/^find/, function (next) {
  const opts =
    typeof this.getOptions === 'function' ? this.getOptions() : this.options;
  if (opts && opts.includeInactive === true) return next();

  // Mặc định chỉ lấy user active
  this.find({ active: { $ne: false } });
  next();
});

// METHOUDS

// crypto || Date
userSchema.methods.generateTokenAndSetFields = function (
  hashField,
  expiresField,
  expiresInMs = 60 * 60 * 1000,
) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this[`${hashField}`] = hashToken(rawToken);
  this[`${expiresField}`] = Date.now() + expiresInMs;
  return rawToken;
};
//

// so sánh password nhập === hs password DB
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcryptjs.compare(candidatePassword, userPassword);
};

// kiểm tra người dùng có thay đổi mk trước lúc cấp JWT

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp; //true:mật khẩu đã được thay đổi sau khi JWT(phải đăng nhập lại)
  }
  return false;
};

// Emai-Verification
userSchema.methods.createEmailVerifyToken = async function () {
  return this.generateTokenAndSetFields('verifyToken', 'verifyTokenExpires');
};
// forgotPassword

userSchema.methods.createPasswordResetToken = async function () {
  return this.generateTokenAndSetFields(
    'passwordResetToken',
    'passwordResetExpires',
  );
};

// RecoverAccount

userSchema.methods.createRestoreToken = async function () {
  return this.generateTokenAndSetFields('restoreToken', 'restoreTokenExpires');
};

const User = mongoose.model('User', userSchema);
export default User;
