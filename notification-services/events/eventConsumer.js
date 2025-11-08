import emailQueue from '../queues/queueEmail.js';

const eventBus = {
  subscribe: (eventNames, callback) => {
    console.log(`Subscriberd to ${eventNames}`);
  },
};
// Các event
eventBus.subscribe('USER_REGISTERED', async data => {
  try {
    await emailQueue.add(
      {
        to: data.email,
        subject: 'Verify your account',
        text: `Hi ${data.name}, please verify your account.`,
      },
      { attempts: 3, backoff: 5000 },
    );
  } catch (err) {}
});
eventBus.subscribe('BOOKING_CONFIRMED', async data => {
  try {
    await emailQueue.add(
      {
        to: data.email,
        subject: 'Booking Confirmed',
        text: `Hi ${data.name}, your booking for ${data.tourName} on ${data.date} is confirmed.`,
      },
      { attempts: 3, backoff: 5000 },
    );
  } catch (err) {}
});
eventBus.subscribe('PAYMENT_SUCCESS', async data => {
  await emailQueue.add(
    {
      to: data.email,
      subject: 'Payment Successful',
      text: `Hi ${data.name}, your payment of ${data.amount} is successful.`,
    },
    { attempts: 3, backoff: 5000 },
  );
});

export default eventBus;
