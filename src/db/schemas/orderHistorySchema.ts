import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const orderHistory = pgTable('order_history', {
  id: serial('id').primaryKey().notNull(),
  userId: integer('user_id').notNull(),
  productId: integer('product_id').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  status: varchar('status', { length: 32 }).notNull().default('confirmed'),
  orderedAt: timestamp('ordered_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
