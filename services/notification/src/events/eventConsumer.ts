import emailQueue from '../queues/queueEmail';

type EventName = 'USER_REGISTERED' | 'BOOKING_CONFIRMED' | 'PAYMENT_SUCCESS';
interface BaseEventData {
  email: string;
  name: string;
}
type EventCallback<T> = (data: T) => Promise<void> | void;

//DATA SHAPES
interface BookingConfirmedData extends BaseEventData {
  tourName: string;
  date: string;
}
interface PaymentSuccessData extends BaseEventData {
  amount: number;
}

// EVENT BUS INTERFACE

interface EventBus {
  subscribe<T>(eventName: EventName, _callback: EventCallback<T>): void;
}
//EVENT BUS(MOCK )
const eventBus: EventBus = {
  subscribe: <T>(eventName: EventName, _callback: EventCallback<T>) => {
    console.log(`Subscriberd to ${eventName}`);
  },
};

// SUBSCRIPTIONS
eventBus.subscribe<BaseEventData>('USER_REGISTERED', async data => {
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

// BOOKING_CONFIRMED
eventBus.subscribe<BookingConfirmedData>('BOOKING_CONFIRMED', async data => {
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

// PAYMENT_SUCCESS
eventBus.subscribe<PaymentSuccessData>('PAYMENT_SUCCESS', async data => {
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
