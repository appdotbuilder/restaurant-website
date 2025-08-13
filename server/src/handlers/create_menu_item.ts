import { db } from '../db';
import { menuItemsTable, menuCategoriesTable } from '../db/schema';
import { type CreateMenuItemInput, type MenuItem } from '../schema';
import { eq } from 'drizzle-orm';

export const createMenuItem = async (input: CreateMenuItemInput): Promise<MenuItem> => {
  try {
    // First verify that the category exists to prevent foreign key constraint violation
    const categoryExists = await db.select({ id: menuCategoriesTable.id })
      .from(menuCategoriesTable)
      .where(eq(menuCategoriesTable.id, input.category_id))
      .limit(1)
      .execute();

    if (categoryExists.length === 0) {
      throw new Error(`Menu category with id ${input.category_id} does not exist`);
    }

    // Insert menu item record
    const result = await db.insert(menuItemsTable)
      .values({
        category_id: input.category_id,
        name: input.name,
        description: input.description,
        ingredients: input.ingredients,
        preparation_info: input.preparation_info,
        price: input.price.toString(), // Convert number to string for numeric column
        image_url: input.image_url,
        is_chefs_special: input.is_chefs_special,
        dietary_info: input.dietary_info,
        display_order: input.display_order
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const menuItem = result[0];
    return {
      ...menuItem,
      price: parseFloat(menuItem.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Menu item creation failed:', error);
    throw error;
  }
};