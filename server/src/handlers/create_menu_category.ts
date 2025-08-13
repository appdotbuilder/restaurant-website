import { db } from '../db';
import { menuCategoriesTable } from '../db/schema';
import { type CreateMenuCategoryInput, type MenuCategory } from '../schema';

export const createMenuCategory = async (input: CreateMenuCategoryInput): Promise<MenuCategory> => {
  try {
    // Insert menu category record
    const result = await db.insert(menuCategoriesTable)
      .values({
        name: input.name,
        description: input.description,
        display_order: input.display_order
      })
      .returning()
      .execute();

    // Return the created menu category
    const menuCategory = result[0];
    return menuCategory;
  } catch (error) {
    console.error('Menu category creation failed:', error);
    throw error;
  }
};