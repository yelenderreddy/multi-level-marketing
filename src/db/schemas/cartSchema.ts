import { pgTable, serial, integer, timestamp } from 'drizzle-orm/pg-core';

export const cart = pgTable('cart', {
  id: serial('id').primaryKey().notNull(),
  userId: integer('user_id').notNull(),
  productId: integer('product_id').notNull(),
  quantity: integer('quantity').notNull().default(1),
  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
