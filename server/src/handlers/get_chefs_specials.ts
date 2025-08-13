import { db } from '../db';
import { menuItemsTable, menuCategoriesTable } from '../db/schema';
import { type MenuItem } from '../schema';
import { eq, desc, and } from 'drizzle-orm';

export const getChefsSpecials = async (): Promise<MenuItem[]> => {
  try {
    // Query for all menu items marked as chef's specials that are available
    // Join with categories to ensure only active categories are included
    const results = await db.select()
      .from(menuItemsTable)
      .innerJoin(menuCategoriesTable, eq(menuItemsTable.category_id, menuCategoriesTable.id))
      .where(and(
        eq(menuItemsTable.is_chefs_special, true),
        eq(menuCategoriesTable.is_active, true)
      ))
      .orderBy(desc(menuItemsTable.display_order), desc(menuItemsTable.created_at))
      .execute();

    // Transform results and handle numeric conversions
    return results.map(result => {
      const menuItem = result.menu_items;
      return {
        ...menuItem,
        price: parseFloat(menuItem.price) // Convert numeric field to number
      };
    });
  } catch (error) {
    console.error('Failed to fetch chef\'s specials:', error);
    throw error;
  }
};