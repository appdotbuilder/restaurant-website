import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { menuItemsTable, menuCategoriesTable } from '../db/schema';
import { type UpdateMenuItemInput } from '../schema';
import { updateMenuItem } from '../handlers/update_menu_item';
import { eq } from 'drizzle-orm';

describe('updateMenuItem', () => {
  let testCategoryId: number;
  let testMenuItemId: number;
  let alternateCategoryId: number;

  beforeEach(async () => {
    await createDB();
    
    // Create test categories
    const categoryResults = await db.insert(menuCategoriesTable)
      .values([
        {
          name: 'Main Courses',
          description: 'Hearty main dishes',
          display_order: 1
        },
        {
          name: 'Appetizers', 
          description: 'Small plates',
          display_order: 2
        }
      ])
      .returning()
      .execute();

    testCategoryId = categoryResults[0].id;
    alternateCategoryId = categoryResults[1].id;

    // Create test menu item
    const menuItemResult = await db.insert(menuItemsTable)
      .values({
        category_id: testCategoryId,
        name: 'Test Pasta',
        description: 'Delicious pasta dish',
        ingredients: 'pasta, tomatoes, cheese',
        preparation_info: 'Cook for 15 minutes',
        price: '18.50',
        image_url: 'https://example.com/pasta.jpg',
        is_chefs_special: false,
        is_available: true,
        dietary_info: 'vegetarian',
        display_order: 1
      })
      .returning()
      .execute();

    testMenuItemId = menuItemResult[0].id;
  });

  afterEach(resetDB);

  it('should update a menu item with all fields', async () => {
    const input: UpdateMenuItemInput = {
      id: testMenuItemId,
      category_id: alternateCategoryId,
      name: 'Updated Pasta Supreme',
      description: 'Even more delicious pasta',
      ingredients: 'pasta, tomatoes, cheese, herbs',
      preparation_info: 'Cook for 20 minutes',
      price: 22.75,
      image_url: 'https://example.com/new-pasta.jpg',
      is_chefs_special: true,
      is_available: false,
      dietary_info: 'vegetarian,gluten-free',
      display_order: 5
    };

    const result = await updateMenuItem(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testMenuItemId);
    expect(result!.category_id).toEqual(alternateCategoryId);
    expect(result!.name).toEqual('Updated Pasta Supreme');
    expect(result!.description).toEqual('Even more delicious pasta');
    expect(result!.ingredients).toEqual('pasta, tomatoes, cheese, herbs');
    expect(result!.preparation_info).toEqual('Cook for 20 minutes');
    expect(result!.price).toEqual(22.75);
    expect(typeof result!.price).toEqual('number');
    expect(result!.image_url).toEqual('https://example.com/new-pasta.jpg');
    expect(result!.is_chefs_special).toEqual(true);
    expect(result!.is_available).toEqual(false);
    expect(result!.dietary_info).toEqual('vegetarian,gluten-free');
    expect(result!.display_order).toEqual(5);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    const input: UpdateMenuItemInput = {
      id: testMenuItemId,
      name: 'Partially Updated Pasta',
      price: 25.00,
      is_chefs_special: true
    };

    const result = await updateMenuItem(input);

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Partially Updated Pasta');
    expect(result!.price).toEqual(25.00);
    expect(result!.is_chefs_special).toEqual(true);
    
    // Other fields should remain unchanged
    expect(result!.description).toEqual('Delicious pasta dish');
    expect(result!.ingredients).toEqual('pasta, tomatoes, cheese');
    expect(result!.is_available).toEqual(true);
    expect(result!.category_id).toEqual(testCategoryId);
  });

  it('should update availability status', async () => {
    const input: UpdateMenuItemInput = {
      id: testMenuItemId,
      is_available: false
    };

    const result = await updateMenuItem(input);

    expect(result).not.toBeNull();
    expect(result!.is_available).toEqual(false);
    
    // All other fields should remain unchanged
    expect(result!.name).toEqual('Test Pasta');
    expect(result!.price).toEqual(18.50);
    expect(result!.is_chefs_special).toEqual(false);
  });

  it('should update chef\'s special status', async () => {
    const input: UpdateMenuItemInput = {
      id: testMenuItemId,
      is_chefs_special: true
    };

    const result = await updateMenuItem(input);

    expect(result).not.toBeNull();
    expect(result!.is_chefs_special).toEqual(true);
    
    // All other fields should remain unchanged
    expect(result!.name).toEqual('Test Pasta');
    expect(result!.is_available).toEqual(true);
  });

  it('should update menu item with null values', async () => {
    const input: UpdateMenuItemInput = {
      id: testMenuItemId,
      image_url: null,
      dietary_info: null
    };

    const result = await updateMenuItem(input);

    expect(result).not.toBeNull();
    expect(result!.image_url).toBeNull();
    expect(result!.dietary_info).toBeNull();
  });

  it('should save updates to database correctly', async () => {
    const input: UpdateMenuItemInput = {
      id: testMenuItemId,
      name: 'Database Test Pasta',
      price: 30.99
    };

    await updateMenuItem(input);

    // Verify changes are persisted in database
    const menuItems = await db.select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.id, testMenuItemId))
      .execute();

    expect(menuItems).toHaveLength(1);
    expect(menuItems[0].name).toEqual('Database Test Pasta');
    expect(parseFloat(menuItems[0].price)).toEqual(30.99);
    expect(menuItems[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent menu item', async () => {
    const input: UpdateMenuItemInput = {
      id: 99999,
      name: 'Non-existent Item'
    };

    const result = await updateMenuItem(input);

    expect(result).toBeNull();
  });

  it('should throw error when updating to non-existent category', async () => {
    const input: UpdateMenuItemInput = {
      id: testMenuItemId,
      category_id: 99999
    };

    await expect(updateMenuItem(input)).rejects.toThrow(/Category with id 99999 does not exist/i);
  });

  it('should update category successfully when category exists', async () => {
    const input: UpdateMenuItemInput = {
      id: testMenuItemId,
      category_id: alternateCategoryId
    };

    const result = await updateMenuItem(input);

    expect(result).not.toBeNull();
    expect(result!.category_id).toEqual(alternateCategoryId);
  });

  it('should handle price updates with decimal precision', async () => {
    const input: UpdateMenuItemInput = {
      id: testMenuItemId,
      price: 15.99
    };

    const result = await updateMenuItem(input);

    expect(result).not.toBeNull();
    expect(result!.price).toEqual(15.99);
    expect(typeof result!.price).toEqual('number');

    // Verify precision is maintained in database
    const dbItems = await db.select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.id, testMenuItemId))
      .execute();

    expect(parseFloat(dbItems[0].price)).toEqual(15.99);
  });

  it('should update display order correctly', async () => {
    const input: UpdateMenuItemInput = {
      id: testMenuItemId,
      display_order: 10
    };

    const result = await updateMenuItem(input);

    expect(result).not.toBeNull();
    expect(result!.display_order).toEqual(10);
  });
});