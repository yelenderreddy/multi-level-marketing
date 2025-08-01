import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';

export const wishlist = pgTable('wishlist', {
  id: serial('id').primaryKey().notNull(),
  userId: integer('user_id').notNull(), // references users.id
  productId: integer('product_id').notNull(), // references products.id
  productName: varchar('product_name', { length: 255 }).notNull(),
  productPrice: integer('productPrice').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
