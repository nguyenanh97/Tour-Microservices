import Stripe from 'stripe';
import Payment from '../models/paymentModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { confirmBookingPayment } from '../services/clientBooking.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// create payment
export const createCheckoutSession = catchAsync(async (req, res, next) => {
  const {
    bookingId,
    amount,
    currency = 'usd',
    userEmail,
    successUrl,
    cancelUrl,
  } = req.body;

  if (!bookingId || !amount || !userEmail) {
    return next(new AppError('Missing required payment information', 400));
  }
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: `Booking #${bookingId}` },
            unit_amount: Math.round(Number(amount)),
          },
          quantity: 1,
        },
      ],
      // URLs to redirect after payment
      success_url:
        successUrl ||
        `${process.env.CLIENT_BASE_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl ||
        `${process.env.CLIENT_BASE_URL || 'http://localhost:3000'}/payment-cancel`,
      metadata: { bookingId },
    });
    await Payment.create({
      bookingId,
      sessionId: session.id,
      paymentIntentId: session.payment_intent || null,
      amount,
      currency,
      customerEmail: userEmail,
      status: 'pending',
      meta: { mode: 'checkout' },
    });
    res.status(200).json({
      status: 'success',
      data: {
        sessionUrl: session.url,
        sessionId: session.id,
        paymentIntentId: session.payment_intent || null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Stripe Webhook to handle (raw body)
export const stripeWebhook = catchAsync(async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      const paymentIntentId = session.payment_intent || null;
      const payment = await Payment.findOneAndUpdate(
        {
          $or: [{ sessionId: session.id }, { paymentIntentId }],
        },
        { $set: { status: 'succeeded', paymentIntentId } },
        { new: true },
      );
      if (payment?.bookingId || bookingId) {
        try {
          await confirmBookingPayment(bookingId || payment.bookingId, {
            paymentIntentId,
            provider: 'stripe',
          });
        } catch (err) {
          console.error(
            '[payment-service] confirmBookingPayment failed:',
            err.response?.data || err.message,
          );
        }
      }
    }
    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      await Payment.findOneAndUpdate(
        { paymentIntentId: pi.id },
        { $set: { status: 'failed' } },
      );
    }
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
});
