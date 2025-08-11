import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Define ENUM for payment_status
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'PAID']);

export const users = pgTable('users', {
  id: serial('id').primaryKey().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  mobileNumber: varchar('mobile_number', { length: 15 }).notNull().unique(),
  address: varchar('address', { length: 255 }),
  gender: varchar('gender', { length: 10 }),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  referral_code: varchar('referral_code', { length: 50 }).notNull().unique(),
  referralCount: integer('referral_count').default(0).notNull(),
  referralCountAtLastRedeem: integer('referral_count_at_last_redeem')
    .default(0)
    .notNull(),

  reward: varchar('reward', { length: 255 }),
  wallet_balance: integer('wallet_balance').default(0).notNull(),
  // establish relationship using referral_code
  referred_by_code: varchar('referred_by_code', { length: 50 }),

  payment_status: paymentStatusEnum('payment_status')
    .default('PENDING')
    .notNull(),
  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
