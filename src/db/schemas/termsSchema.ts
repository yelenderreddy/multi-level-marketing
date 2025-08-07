import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const terms = pgTable('terms', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
