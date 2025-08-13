import { db } from '../db';
import { menuItemsTable, menuCategoriesTable } from '../db/schema';
import { type UpdateMenuItemInput, type MenuItem } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateMenuItem(input: UpdateMenuItemInput): Promise<MenuItem | null> {
  try {
    // Check if the menu item exists
    const existingItems = await db.select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.id, input.id))
      .execute();

    if (existingItems.length === 0) {
      return null;
    }

    // If category_id is being updated, verify the category exists
    if (input.category_id !== undefined) {
      const categoryExists = await db.select()
        .from(menuCategoriesTable)
        .where(eq(menuCategoriesTable.id, input.category_id))
        .execute();

      if (categoryExists.length === 0) {
        throw new Error(`Category with id ${input.category_id} does not exist`);
      }
    }

    // Build update data, converting numeric fields to strings
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.category_id !== undefined) updateData.category_id = input.category_id;
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.ingredients !== undefined) updateData.ingredients = input.ingredients;
    if (input.preparation_info !== undefined) updateData.preparation_info = input.preparation_info;
    if (input.price !== undefined) updateData.price = input.price.toString(); // Convert to string for numeric column
    if (input.image_url !== undefined) updateData.image_url = input.image_url;
    if (input.is_chefs_special !== undefined) updateData.is_chefs_special = input.is_chefs_special;
    if (input.is_available !== undefined) updateData.is_available = input.is_available;
    if (input.dietary_info !== undefined) updateData.dietary_info = input.dietary_info;
    if (input.display_order !== undefined) updateData.display_order = input.display_order;

    // Update the menu item
    const result = await db.update(menuItemsTable)
      .set(updateData)
      .where(eq(menuItemsTable.id, input.id))
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const menuItem = result[0];
    return {
      ...menuItem,
      price: parseFloat(menuItem.price)
    };
  } catch (error) {
    console.error('Menu item update failed:', error);
    throw error;
  }
}