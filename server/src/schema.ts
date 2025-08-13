import { z } from 'zod';

// Menu Category schema
export const menuCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  display_order: z.number().int(),
  is_active: z.boolean(),
  created_at: z.coerce.date()
});

export type MenuCategory = z.infer<typeof menuCategorySchema>;

// Menu Item schema
export const menuItemSchema = z.object({
  id: z.number(),
  category_id: z.number(),
  name: z.string(),
  description: z.string(),
  ingredients: z.string(),
  preparation_info: z.string(),
  price: z.number(),
  image_url: z.string().nullable(),
  is_chefs_special: z.boolean(),
  is_available: z.boolean(),
  dietary_info: z.string().nullable(), // e.g., "vegetarian,gluten-free"
  display_order: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type MenuItem = z.infer<typeof menuItemSchema>;

// Reservation schema
export const reservationSchema = z.object({
  id: z.number(),
  customer_name: z.string(),
  customer_email: z.string(),
  customer_phone: z.string(),
  party_size: z.number().int(),
  reservation_date: z.coerce.date(),
  reservation_time: z.string(), // Store as time string like "19:30"
  special_requests: z.string().nullable(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Reservation = z.infer<typeof reservationSchema>;

// Input schemas for creating menu categories
export const createMenuCategoryInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  display_order: z.number().int().nonnegative()
});

export type CreateMenuCategoryInput = z.infer<typeof createMenuCategoryInputSchema>;

// Input schemas for creating menu items
export const createMenuItemInputSchema = z.object({
  category_id: z.number(),
  name: z.string().min(1),
  description: z.string().min(1),
  ingredients: z.string().min(1),
  preparation_info: z.string().min(1),
  price: z.number().positive(),
  image_url: z.string().url().nullable(),
  is_chefs_special: z.boolean().default(false),
  dietary_info: z.string().nullable(),
  display_order: z.number().int().nonnegative()
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemInputSchema>;

// Input schemas for updating menu items
export const updateMenuItemInputSchema = z.object({
  id: z.number(),
  category_id: z.number().optional(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  ingredients: z.string().min(1).optional(),
  preparation_info: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  image_url: z.string().url().nullable().optional(),
  is_chefs_special: z.boolean().optional(),
  is_available: z.boolean().optional(),
  dietary_info: z.string().nullable().optional(),
  display_order: z.number().int().nonnegative().optional()
});

export type UpdateMenuItemInput = z.infer<typeof updateMenuItemInputSchema>;

// Input schemas for creating reservations
export const createReservationInputSchema = z.object({
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_phone: z.string().min(10),
  party_size: z.number().int().min(1).max(20),
  reservation_date: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed >= new Date();
  }, "Reservation date must be today or in the future"),
  reservation_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
  special_requests: z.string().nullable()
});

export type CreateReservationInput = z.infer<typeof createReservationInputSchema>;

// Input schemas for updating reservation status
export const updateReservationStatusInputSchema = z.object({
  id: z.number(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed'])
});

export type UpdateReservationStatusInput = z.infer<typeof updateReservationStatusInputSchema>;

// Query input for getting menu items by category
export const getMenuItemsByCategoryInputSchema = z.object({
  categoryId: z.number()
});

export type GetMenuItemsByCategoryInput = z.infer<typeof getMenuItemsByCategoryInputSchema>;

// Query input for getting menu item details
export const getMenuItemDetailsInputSchema = z.object({
  itemId: z.number()
});

export type GetMenuItemDetailsInput = z.infer<typeof getMenuItemDetailsInputSchema>;

// Query input for getting reservations by date
export const getReservationsByDateInputSchema = z.object({
  date: z.string().refine((date) => {
    return !isNaN(new Date(date).getTime());
  }, "Invalid date format")
});

export type GetReservationsByDateInput = z.infer<typeof getReservationsByDateInputSchema>;