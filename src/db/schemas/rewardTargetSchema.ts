import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';

export const rewardTargets = pgTable('reward_targets', {
  id: serial('id').primaryKey().notNull(),
  referralCount: integer('referral_count').notNull(),
  reward: varchar('reward', { length: 255 }).notNull(),
  target: varchar('target', { length: 255 }),
  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
