import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: false, // auth-service giữ ràng buộc chính, profile có thể lưu để tra cứu nhanh
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
      index: true,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: { type: Number },
    active: { type: Boolean, default: true, select: false },
    deletedAt: { type: Date, default: null },
    avatar: { type: String, default: '' },
    phone: { type: String, trim: true },
    address: { type: String, default: '' },
    bio: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// Soft-delete filter
userProfileSchema.pre(/^find/, function (next) {
  const opts =
    typeof this.getOptions === 'function' ? this.getOptions() : this.options;
  if (opts && opts.includeInactive === true) return next();
  this.find({ active: { $ne: false } });
  next();
});

// Instance helpers
userProfileSchema.methods.softDelete = function () {
  this.active = false;
  this.deletedAt = new Date();
  return this.save();
};
userProfileSchema.methods.restore = function () {
  this.active = true;
  this.deletedAt = null;
  return this.save();
};

// Static helper
userProfileSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId });
};

// Output transform
userProfileSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.__v;
    if (ret.deletedAt === null) delete ret.deletedAt;
    return ret;
  },
});

// Text index for search
userProfileSchema.index({ name: 'text', bio: 'text' });

export default mongoose.model('UserProfile', userProfileSchema);
