import { db } from '../db';
import { menuItemsTable } from '../db/schema';
import { type GetMenuItemDetailsInput, type MenuItem } from '../schema';
import { eq } from 'drizzle-orm';

export async function getMenuItemDetails(input: GetMenuItemDetailsInput): Promise<MenuItem | null> {
  try {
    // Query menu item by ID
    const results = await db.select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.id, input.itemId))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const menuItem = results[0];
    
    // Convert numeric field back to number before returning
    return {
      ...menuItem,
      price: parseFloat(menuItem.price)
    };
  } catch (error) {
    console.error('Failed to get menu item details:', error);
    throw error;
  }
}