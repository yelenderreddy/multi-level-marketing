import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './userSchema';

// Create enum for redeem status
export const redeemStatusEnum = pgEnum('redeem_status', [
  'processing',
  'deposited',
]);

export const userBankDetails = pgTable('user_bank_details', {
  id: serial('id').primaryKey().notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountNumber: varchar('account_number', { length: 50 }).notNull(),
  ifscCode: varchar('ifsc_code', { length: 20 }).notNull(),
  bankName: varchar('bank_name', { length: 255 }).notNull(),
  accountHolderName: varchar('account_holder_name', { length: 255 }).notNull(),
  redeemAmount: integer('redeem_amount').default(0).notNull(),
  redeemStatus: redeemStatusEnum('redeem_status')
    .default('processing')
    .notNull(),
  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
