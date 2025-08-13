import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { menuItemsTable, menuCategoriesTable } from '../db/schema';
import { type CreateMenuItemInput } from '../schema';
import { createMenuItem } from '../handlers/create_menu_item';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateMenuItemInput = {
  category_id: 1,
  name: 'Margherita Pizza',
  description: 'Classic Italian pizza with fresh basil and mozzarella',
  ingredients: 'Pizza dough, tomato sauce, fresh mozzarella, basil, olive oil',
  preparation_info: 'Hand-stretched dough, wood-fired at 450°F for 12-15 minutes',
  price: 18.99,
  image_url: 'https://example.com/margherita.jpg',
  is_chefs_special: false,
  dietary_info: 'vegetarian',
  display_order: 1
};

// Test input with nullable fields
const testInputWithNulls: CreateMenuItemInput = {
  category_id: 1,
  name: 'Special Pasta',
  description: 'Chef special pasta dish',
  ingredients: 'Pasta, secret sauce',
  preparation_info: 'Cooked with love',
  price: 24.50,
  image_url: null,
  is_chefs_special: true,
  dietary_info: null,
  display_order: 2
};

describe('createMenuItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test category
  const createTestCategory = async () => {
    const result = await db.insert(menuCategoriesTable)
      .values({
        name: 'Main Courses',
        description: 'Our delicious main dishes',
        display_order: 1
      })
      .returning()
      .execute();
    return result[0];
  };

  it('should create a menu item with all fields', async () => {
    // Create prerequisite category first
    await createTestCategory();

    const result = await createMenuItem(testInput);

    // Basic field validation
    expect(result.category_id).toEqual(1);
    expect(result.name).toEqual('Margherita Pizza');
    expect(result.description).toEqual(testInput.description);
    expect(result.ingredients).toEqual(testInput.ingredients);
    expect(result.preparation_info).toEqual(testInput.preparation_info);
    expect(result.price).toEqual(18.99);
    expect(typeof result.price).toEqual('number'); // Test numeric conversion
    expect(result.image_url).toEqual('https://example.com/margherita.jpg');
    expect(result.is_chefs_special).toEqual(false);
    expect(result.is_available).toEqual(true); // Default value
    expect(result.dietary_info).toEqual('vegetarian');
    expect(result.display_order).toEqual(1);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a menu item with nullable fields', async () => {
    // Create prerequisite category first
    await createTestCategory();

    const result = await createMenuItem(testInputWithNulls);

    // Validate nullable fields
    expect(result.image_url).toBeNull();
    expect(result.dietary_info).toBeNull();
    expect(result.is_chefs_special).toEqual(true);
    expect(result.price).toEqual(24.50);
    expect(typeof result.price).toEqual('number');
    expect(result.name).toEqual('Special Pasta');
  });

  it('should save menu item to database', async () => {
    // Create prerequisite category first
    await createTestCategory();

    const result = await createMenuItem(testInput);

    // Query database directly to verify storage
    const menuItems = await db.select()
      .from(menuItemsTable)
      .where(eq(menuItemsTable.id, result.id))
      .execute();

    expect(menuItems).toHaveLength(1);
    const savedItem = menuItems[0];
    expect(savedItem.name).toEqual('Margherita Pizza');
    expect(savedItem.description).toEqual(testInput.description);
    expect(parseFloat(savedItem.price)).toEqual(18.99); // Verify numeric storage
    expect(savedItem.ingredients).toEqual(testInput.ingredients);
    expect(savedItem.preparation_info).toEqual(testInput.preparation_info);
    expect(savedItem.is_chefs_special).toEqual(false);
    expect(savedItem.is_available).toEqual(true);
    expect(savedItem.created_at).toBeInstanceOf(Date);
    expect(savedItem.updated_at).toBeInstanceOf(Date);
  });

  it('should apply default values correctly', async () => {
    // Create prerequisite category first
    await createTestCategory();

    // Input without explicit defaults
    const inputWithoutDefaults: CreateMenuItemInput = {
      category_id: 1,
      name: 'Test Item',
      description: 'Test description',
      ingredients: 'Test ingredients',
      preparation_info: 'Test prep',
      price: 15.00,
      image_url: null,
      is_chefs_special: false, // Explicitly set default
      dietary_info: null,
      display_order: 0
    };

    const result = await createMenuItem(inputWithoutDefaults);

    // Verify default values from schema
    expect(result.is_available).toEqual(true); // Database default
    expect(result.is_chefs_special).toEqual(false);
    expect(result.display_order).toEqual(0);
  });

  it('should throw error when category does not exist', async () => {
    // Don't create category - test foreign key constraint

    await expect(createMenuItem(testInput)).rejects.toThrow(/Menu category with id 1 does not exist/i);
  });

  it('should handle menu items with different price formats', async () => {
    // Create prerequisite category first
    await createTestCategory();

    // Test with different price values
    const priceTests = [
      { price: 10.00, expected: 10 },
      { price: 15.99, expected: 15.99 },
      { price: 100.50, expected: 100.50 },
      { price: 9.95, expected: 9.95 }
    ];

    for (const { price, expected } of priceTests) {
      const input = { ...testInput, price, name: `Test Item ${price}` };
      const result = await createMenuItem(input);
      
      expect(result.price).toEqual(expected);
      expect(typeof result.price).toEqual('number');
    }
  });

  it('should preserve special characters in text fields', async () => {
    // Create prerequisite category first
    await createTestCategory();

    const specialInput: CreateMenuItemInput = {
      category_id: 1,
      name: 'Café Crème Brûlée',
      description: 'Rich dessert with "special" ingredients & flavors',
      ingredients: 'Heavy cream, eggs, sugar, vanilla extract, caramelized sugar',
      preparation_info: 'Bake at 325°F for 45 mins, chill & torch before serving',
      price: 12.95,
      image_url: null,
      is_chefs_special: true,
      dietary_info: 'contains dairy, gluten-free available',
      display_order: 5
    };

    const result = await createMenuItem(specialInput);

    expect(result.name).toEqual('Café Crème Brûlée');
    expect(result.description).toContain('"special"');
    expect(result.description).toContain('&');
    expect(result.preparation_info).toContain('325°F');
    expect(result.dietary_info).toContain('gluten-free');
  });
});