import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const redeemStatusEnum = pgEnum('redeem_status', [
  'processing',
  'deposited',
]);

export const redeemHistory = pgTable('redeem_history', {
  id: serial('id').primaryKey().notNull(),
  userId: integer('user_id').notNull(),
  redeemAmount: integer('redeem_amount').notNull(),
  status: redeemStatusEnum('status').default('processing').notNull(),
  bankDetails: varchar('bank_details', { length: 500 }), // JSON string of bank details
  redeemedAt: timestamp('redeemed_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  depositedAt: timestamp('deposited_at', { withTimezone: true }),
});
