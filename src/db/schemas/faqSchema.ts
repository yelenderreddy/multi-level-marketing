import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';

export const faqs = pgTable('faqs', {
  id: serial('id').primaryKey().notNull(),

  question: text('question').notNull(),

  answer: text('answer').notNull(),

  category: varchar('category', { length: 100 }), // optional

  isActive: boolean('is_active').notNull().default(true),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
