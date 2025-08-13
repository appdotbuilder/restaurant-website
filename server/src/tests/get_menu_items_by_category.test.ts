import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { menuCategoriesTable, menuItemsTable } from '../db/schema';
import { type GetMenuItemsByCategoryInput } from '../schema';
import { getMenuItemsByCategory } from '../handlers/get_menu_items_by_category';

describe('getMenuItemsByCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return menu items for a specific category ordered by display_order', async () => {
    // Create test category
    const [category] = await db.insert(menuCategoriesTable)
      .values({
        name: 'Appetizers',
        description: 'Start your meal right',
        display_order: 1
      })
      .returning()
      .execute();

    // Create test menu items with different display orders
    const menuItems = [
      {
        category_id: category.id,
        name: 'Spring Rolls',
        description: 'Fresh vegetable spring rolls',
        ingredients: 'Vegetables, rice paper, herbs',
        preparation_info: 'Fresh and cold',
        price: '12.99',
        display_order: 2,
        is_chefs_special: false,
        dietary_info: 'vegetarian'
      },
      {
        category_id: category.id,
        name: 'Buffalo Wings',
        description: 'Spicy chicken wings',
        ingredients: 'Chicken, buffalo sauce, celery',
        preparation_info: 'Fried and tossed in sauce',
        price: '15.99',
        display_order: 1,
        is_chefs_special: true,
        dietary_info: null
      },
      {
        category_id: category.id,
        name: 'Mozzarella Sticks',
        description: 'Breaded mozzarella sticks',
        ingredients: 'Mozzarella, breadcrumbs',
        preparation_info: 'Deep fried',
        price: '9.99',
        display_order: 3,
        is_chefs_special: false,
        dietary_info: 'vegetarian'
      }
    ];

    await db.insert(menuItemsTable)
      .values(menuItems)
      .execute();

    const input: GetMenuItemsByCategoryInput = {
      categoryId: category.id
    };

    const result = await getMenuItemsByCategory(input);

    // Should return 3 items ordered by display_order
    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('Buffalo Wings'); // display_order: 1
    expect(result[1].name).toEqual('Spring Rolls'); // display_order: 2  
    expect(result[2].name).toEqual('Mozzarella Sticks'); // display_order: 3

    // Verify all fields are present and correct types
    result.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.category_id).toEqual(category.id);
      expect(typeof item.name).toBe('string');
      expect(typeof item.description).toBe('string');
      expect(typeof item.ingredients).toBe('string');
      expect(typeof item.preparation_info).toBe('string');
      expect(typeof item.price).toBe('number'); // Should be converted from string
      expect(typeof item.is_chefs_special).toBe('boolean');
      expect(typeof item.is_available).toBe('boolean');
      expect(typeof item.display_order).toBe('number');
      expect(item.created_at).toBeInstanceOf(Date);
      expect(item.updated_at).toBeInstanceOf(Date);
    });

    // Verify specific price conversions
    expect(result[0].price).toEqual(15.99);
    expect(result[1].price).toEqual(12.99);
    expect(result[2].price).toEqual(9.99);
  });

  it('should return empty array for category with no items', async () => {
    // Create category with no items
    const [category] = await db.insert(menuCategoriesTable)
      .values({
        name: 'Empty Category',
        description: 'A category with no items',
        display_order: 1
      })
      .returning()
      .execute();

    const input: GetMenuItemsByCategoryInput = {
      categoryId: category.id
    };

    const result = await getMenuItemsByCategory(input);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return empty array for non-existent category', async () => {
    const input: GetMenuItemsByCategoryInput = {
      categoryId: 999999
    };

    const result = await getMenuItemsByCategory(input);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should only return available items', async () => {
    // Create test category
    const [category] = await db.insert(menuCategoriesTable)
      .values({
        name: 'Test Category',
        description: 'Testing availability',
        display_order: 1
      })
      .returning()
      .execute();

    // Create menu items with different availability
    await db.insert(menuItemsTable)
      .values([
        {
          category_id: category.id,
          name: 'Available Item',
          description: 'This item is available',
          ingredients: 'Test ingredients',
          preparation_info: 'Test prep',
          price: '10.00',
          display_order: 1,
          is_available: true
        },
        {
          category_id: category.id,
          name: 'Unavailable Item',
          description: 'This item is not available',
          ingredients: 'Test ingredients',
          preparation_info: 'Test prep',
          price: '15.00',
          display_order: 2,
          is_available: false
        }
      ])
      .execute();

    const input: GetMenuItemsByCategoryInput = {
      categoryId: category.id
    };

    const result = await getMenuItemsByCategory(input);

    // Should only return the available item
    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Available Item');
    expect(result[0].is_available).toBe(true);
  });

  it('should handle special characters and null values correctly', async () => {
    // Create test category
    const [category] = await db.insert(menuCategoriesTable)
      .values({
        name: 'Special Items',
        description: 'Items with special properties',
        display_order: 1
      })
      .returning()
      .execute();

    // Create item with special characters and null values
    await db.insert(menuItemsTable)
      .values({
        category_id: category.id,
        name: 'Spécial Ítém',
        description: 'Item with accents & symbols',
        ingredients: 'Special ingredients with "quotes"',
        preparation_info: 'Preparation with apostrophe\'s',
        price: '25.50',
        display_order: 1,
        image_url: null,
        dietary_info: null
      })
      .execute();

    const input: GetMenuItemsByCategoryInput = {
      categoryId: category.id
    };

    const result = await getMenuItemsByCategory(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Spécial Ítém');
    expect(result[0].description).toEqual('Item with accents & symbols');
    expect(result[0].ingredients).toEqual('Special ingredients with "quotes"');
    expect(result[0].preparation_info).toEqual('Preparation with apostrophe\'s');
    expect(result[0].price).toEqual(25.50);
    expect(result[0].image_url).toBeNull();
    expect(result[0].dietary_info).toBeNull();
  });

  it('should handle multiple categories independently', async () => {
    // Create two different categories
    const [category1] = await db.insert(menuCategoriesTable)
      .values({
        name: 'Category 1',
        description: 'First category',
        display_order: 1
      })
      .returning()
      .execute();

    const [category2] = await db.insert(menuCategoriesTable)
      .values({
        name: 'Category 2',
        description: 'Second category',
        display_order: 2
      })
      .returning()
      .execute();

    // Create items in both categories
    await db.insert(menuItemsTable)
      .values([
        {
          category_id: category1.id,
          name: 'Item from Category 1',
          description: 'Belongs to first category',
          ingredients: 'Test ingredients',
          preparation_info: 'Test prep',
          price: '10.00',
          display_order: 1
        },
        {
          category_id: category2.id,
          name: 'Item from Category 2',
          description: 'Belongs to second category',
          ingredients: 'Test ingredients',
          preparation_info: 'Test prep',
          price: '15.00',
          display_order: 1
        }
      ])
      .execute();

    // Query first category
    const result1 = await getMenuItemsByCategory({ categoryId: category1.id });
    expect(result1).toHaveLength(1);
    expect(result1[0].name).toEqual('Item from Category 1');
    expect(result1[0].category_id).toEqual(category1.id);

    // Query second category
    const result2 = await getMenuItemsByCategory({ categoryId: category2.id });
    expect(result2).toHaveLength(1);
    expect(result2[0].name).toEqual('Item from Category 2');
    expect(result2[0].category_id).toEqual(category2.id);
  });
});