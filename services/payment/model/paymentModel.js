import mongoose from 'mongoose';
const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, index: true },
    provider: { type: String, enum: ['stripe', 'paypal'], default: 'stripe' },
    sessionId: { type: String, index: true },
    paymentId: { type: String, unique: true, sparse: true },
    amount: { type: Number, require: true },
    currency: { type: String, default: 'usd' },
    customerEmail: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'paid'],
      default: 'pending',
    },
    meta: { type: Object },
  },
  { timestamps: true },
);
export default mongoose.model('Payment', paymentSchema);
