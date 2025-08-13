import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum for reservation status
export const reservationStatusEnum = pgEnum('reservation_status', ['pending', 'confirmed', 'cancelled', 'completed']);

// Menu Categories table
export const menuCategoriesTable = pgTable('menu_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'), // Nullable by default
  display_order: integer('display_order').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Menu Items table
export const menuItemsTable = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  category_id: integer('category_id').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  ingredients: text('ingredients').notNull(),
  preparation_info: text('preparation_info').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  image_url: text('image_url'), // Nullable for placeholder images
  is_chefs_special: boolean('is_chefs_special').notNull().default(false),
  is_available: boolean('is_available').notNull().default(true),
  dietary_info: text('dietary_info'), // Nullable, comma-separated values like "vegetarian,gluten-free"
  display_order: integer('display_order').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Reservations table
export const reservationsTable = pgTable('reservations', {
  id: serial('id').primaryKey(),
  customer_name: text('customer_name').notNull(),
  customer_email: text('customer_email').notNull(),
  customer_phone: text('customer_phone').notNull(),
  party_size: integer('party_size').notNull(),
  reservation_date: timestamp('reservation_date').notNull(),
  reservation_time: text('reservation_time').notNull(), // Store time as string like "19:30"
  special_requests: text('special_requests'), // Nullable
  status: reservationStatusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const menuCategoriesRelations = relations(menuCategoriesTable, ({ many }) => ({
  menuItems: many(menuItemsTable),
}));

export const menuItemsRelations = relations(menuItemsTable, ({ one }) => ({
  category: one(menuCategoriesTable, {
    fields: [menuItemsTable.category_id],
    references: [menuCategoriesTable.id],
  }),
}));

// TypeScript types for the table schemas
export type MenuCategory = typeof menuCategoriesTable.$inferSelect;
export type NewMenuCategory = typeof menuCategoriesTable.$inferInsert;

export type MenuItem = typeof menuItemsTable.$inferSelect;
export type NewMenuItem = typeof menuItemsTable.$inferInsert;

export type Reservation = typeof reservationsTable.$inferSelect;
export type NewReservation = typeof reservationsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  menuCategories: menuCategoriesTable,
  menuItems: menuItemsTable,
  reservations: reservationsTable,
};

export const tableRelations = {
  menuCategoriesRelations,
  menuItemsRelations,
};