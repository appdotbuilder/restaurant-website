import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { menuCategoriesTable, menuItemsTable } from '../db/schema';
import { type GetMenuItemDetailsInput } from '../schema';
import { getMenuItemDetails } from '../handlers/get_menu_item_details';

describe('getMenuItemDetails', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return menu item details by ID', async () => {
    // Create a test category first (foreign key requirement)
    const categoryResult = await db.insert(menuCategoriesTable)
      .values({
        name: 'Test Category',
        description: 'Category for testing',
        display_order: 1
      })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create a test menu item
    const menuItemResult = await db.insert(menuItemsTable)
      .values({
        category_id: categoryId,
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon grilled to perfection',
        ingredients: 'Salmon, lemon, herbs, olive oil',
        preparation_info: 'Grilled over medium heat for 6-8 minutes per side',
        price: '24.99',
        image_url: 'https://example.com/salmon.jpg',
        is_chefs_special: true,
        is_available: true,
        dietary_info: 'gluten-free,keto-friendly',
        display_order: 1
      })
      .returning()
      .execute();

    const menuItem = menuItemResult[0];
    const input: GetMenuItemDetailsInput = { itemId: menuItem.id };

    const result = await getMenuItemDetails(input);

    // Verify all fields are returned correctly
    expect(result).toBeDefined();
    expect(result!.id).toEqual(menuItem.id);
    expect(result!.category_id).toEqual(categoryId);
    expect(result!.name).toEqual('Grilled Salmon');
    expect(result!.description).toEqual('Fresh Atlantic salmon grilled to perfection');
    expect(result!.ingredients).toEqual('Salmon, lemon, herbs, olive oil');
    expect(result!.preparation_info).toEqual('Grilled over medium heat for 6-8 minutes per side');
    expect(result!.price).toEqual(24.99); // Verify numeric conversion
    expect(typeof result!.price).toEqual('number');
    expect(result!.image_url).toEqual('https://example.com/salmon.jpg');
    expect(result!.is_chefs_special).toEqual(true);
    expect(result!.is_available).toEqual(true);
    expect(result!.dietary_info).toEqual('gluten-free,keto-friendly');
    expect(result!.display_order).toEqual(1);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when menu item is not found', async () => {
    const input: GetMenuItemDetailsInput = { itemId: 999 };

    const result = await getMenuItemDetails(input);

    expect(result).toBeNull();
  });

  it('should handle menu item with minimal data', async () => {
    // Create a test category first
    const categoryResult = await db.insert(menuCategoriesTable)
      .values({
        name: 'Basic Category',
        description: null,
        display_order: 1
      })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create menu item with minimal required fields
    const menuItemResult = await db.insert(menuItemsTable)
      .values({
        category_id: categoryId,
        name: 'Simple Dish',
        description: 'A simple dish',
        ingredients: 'Basic ingredients',
        preparation_info: 'Simple preparation',
        price: '12.50',
        image_url: null,
        is_chefs_special: false,
        is_available: true,
        dietary_info: null,
        display_order: 0
      })
      .returning()
      .execute();

    const menuItem = menuItemResult[0];
    const input: GetMenuItemDetailsInput = { itemId: menuItem.id };

    const result = await getMenuItemDetails(input);

    expect(result).toBeDefined();
    expect(result!.name).toEqual('Simple Dish');
    expect(result!.price).toEqual(12.5);
    expect(typeof result!.price).toEqual('number');
    expect(result!.image_url).toBeNull();
    expect(result!.dietary_info).toBeNull();
    expect(result!.is_chefs_special).toEqual(false);
  });

  it('should handle unavailable menu item', async () => {
    // Create a test category first
    const categoryResult = await db.insert(menuCategoriesTable)
      .values({
        name: 'Test Category',
        description: 'Category for testing',
        display_order: 1
      })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create unavailable menu item
    const menuItemResult = await db.insert(menuItemsTable)
      .values({
        category_id: categoryId,
        name: 'Unavailable Dish',
        description: 'Currently not available',
        ingredients: 'Seasonal ingredients',
        preparation_info: 'Special preparation',
        price: '18.00',
        image_url: null,
        is_chefs_special: false,
        is_available: false, // Not available
        dietary_info: 'vegetarian',
        display_order: 2
      })
      .returning()
      .execute();

    const menuItem = menuItemResult[0];
    const input: GetMenuItemDetailsInput = { itemId: menuItem.id };

    const result = await getMenuItemDetails(input);

    expect(result).toBeDefined();
    expect(result!.name).toEqual('Unavailable Dish');
    expect(result!.is_available).toEqual(false);
    expect(result!.price).toEqual(18);
    expect(typeof result!.price).toEqual('number');
  });
});