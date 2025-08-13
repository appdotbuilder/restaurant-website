import { db } from '../db';
import { menuItemsTable, menuCategoriesTable } from '../db/schema';
import { type GetMenuItemsByCategoryInput, type MenuItem } from '../schema';
import { eq, asc, and } from 'drizzle-orm';

export async function getMenuItemsByCategory(input: GetMenuItemsByCategoryInput): Promise<MenuItem[]> {
  try {
    // Query menu items for the specified category, ordered by display_order
    const results = await db.select()
      .from(menuItemsTable)
      .where(
        and(
          eq(menuItemsTable.category_id, input.categoryId),
          eq(menuItemsTable.is_available, true)
        )
      )
      .orderBy(asc(menuItemsTable.display_order))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(item => ({
      ...item,
      price: parseFloat(item.price) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch menu items by category:', error);
    throw error;
  }
}