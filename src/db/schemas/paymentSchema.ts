import {
  pgTable,
  serial,
  varchar,
  integer,
  numeric,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
]);

export const payments = pgTable('payments', {
  id: serial('id').primaryKey().notNull(),

  user_id: integer('user_id').notNull(), // FK to users.id

  order_id: varchar('order_id', { length: 255 }).notNull(), // Razorpay order id

  payment_id: varchar('payment_id', { length: 255 }), // Razorpay payment id, after success

  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(), // in INR

  currency: varchar('currency', { length: 10 }).default('INR').notNull(),

  status: paymentStatusEnum('status').default('PENDING').notNull(),

  receipt: varchar('receipt', { length: 255 }), // optional

  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
