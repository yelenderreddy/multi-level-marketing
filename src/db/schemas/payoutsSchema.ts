import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  text,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const payoutStatusEnum = pgEnum('payout_status', [
  'pending',
  'completed',
  'failed',
  'processing',
]);

export const payouts = pgTable('payouts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  payoutId: varchar('payout_id', { length: 50 }).notNull().unique(),
  amount: integer('amount').notNull(),
  method: varchar('method', { length: 50 }).notNull(), // 'Bank Transfer', 'UPI', etc.
  status: payoutStatusEnum('status').default('pending').notNull(),
  description: text('description').notNull(),
  bankDetails: text('bank_details').notNull(),
  transactionId: varchar('transaction_id', { length: 100 }),
  date: timestamp('date').defaultNow().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
