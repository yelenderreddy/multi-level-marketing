import {
  pgTable,
  serial,
  varchar,
  integer,
  pgEnum,
  timestamp,
  text,
} from 'drizzle-orm/pg-core';

// Optional ENUM for product status
export const productStatusEnum = pgEnum('product_status', [
  'AVAILABLE',
  'OUT_OF_STOCK',
  'DISCONTINUED',
]);

export const products = pgTable('products', {
  id: serial('id').primaryKey().notNull(),

  productName: varchar('productName', { length: 255 }).notNull(),
  description: text('description'),
  photo: varchar('photo', { length: 255 }),
  productPrice: integer('productPrice').notNull().default(0),
  productCount: integer('productCount').notNull().default(0),
  productStatus: productStatusEnum('productStatus')
    .notNull()
    .default('AVAILABLE'),
  productCode: integer('productCode').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
