import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { menuCategoriesTable } from '../db/schema';
import { type CreateMenuCategoryInput } from '../schema';
import { createMenuCategory } from '../handlers/create_menu_category';
import { eq, desc } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateMenuCategoryInput = {
  name: 'Appetizers',
  description: 'Light dishes to start your meal',
  display_order: 1
};

describe('createMenuCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a menu category', async () => {
    const result = await createMenuCategory(testInput);

    // Basic field validation
    expect(result.name).toEqual('Appetizers');
    expect(result.description).toEqual('Light dishes to start your meal');
    expect(result.display_order).toEqual(1);
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save menu category to database', async () => {
    const result = await createMenuCategory(testInput);

    // Query using proper drizzle syntax
    const categories = await db.select()
      .from(menuCategoriesTable)
      .where(eq(menuCategoriesTable.id, result.id))
      .execute();

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toEqual('Appetizers');
    expect(categories[0].description).toEqual('Light dishes to start your meal');
    expect(categories[0].display_order).toEqual(1);
    expect(categories[0].is_active).toEqual(true);
    expect(categories[0].created_at).toBeInstanceOf(Date);
  });

  it('should create menu category with null description', async () => {
    const inputWithNullDescription: CreateMenuCategoryInput = {
      name: 'Main Courses',
      description: null,
      display_order: 2
    };

    const result = await createMenuCategory(inputWithNullDescription);

    expect(result.name).toEqual('Main Courses');
    expect(result.description).toBeNull();
    expect(result.display_order).toEqual(2);
    expect(result.is_active).toEqual(true);
  });

  it('should create multiple categories with different display orders', async () => {
    const category1: CreateMenuCategoryInput = {
      name: 'Appetizers',
      description: 'Start with these',
      display_order: 1
    };

    const category2: CreateMenuCategoryInput = {
      name: 'Main Courses',
      description: 'Our main offerings',
      display_order: 2
    };

    const category3: CreateMenuCategoryInput = {
      name: 'Desserts',
      description: 'Sweet endings',
      display_order: 3
    };

    const result1 = await createMenuCategory(category1);
    const result2 = await createMenuCategory(category2);
    const result3 = await createMenuCategory(category3);

    // Verify all categories were created
    expect(result1.display_order).toEqual(1);
    expect(result2.display_order).toEqual(2);
    expect(result3.display_order).toEqual(3);

    // Query all categories ordered by display_order
    const allCategories = await db.select()
      .from(menuCategoriesTable)
      .orderBy(menuCategoriesTable.display_order)
      .execute();

    expect(allCategories).toHaveLength(3);
    expect(allCategories[0].name).toEqual('Appetizers');
    expect(allCategories[1].name).toEqual('Main Courses');
    expect(allCategories[2].name).toEqual('Desserts');
  });

  it('should query categories by active status correctly', async () => {
    // Create test category
    await createMenuCategory(testInput);

    // Query active categories (all should be active by default)
    const activeCategories = await db.select()
      .from(menuCategoriesTable)
      .where(eq(menuCategoriesTable.is_active, true))
      .execute();

    expect(activeCategories.length).toBeGreaterThan(0);
    activeCategories.forEach(category => {
      expect(category.is_active).toBe(true);
      expect(category.created_at).toBeInstanceOf(Date);
    });
  });

  it('should order categories by display_order correctly', async () => {
    // Create categories in random order
    await createMenuCategory({
      name: 'Desserts',
      description: 'Sweet treats',
      display_order: 30
    });

    await createMenuCategory({
      name: 'Appetizers',
      description: 'Starters',
      display_order: 10
    });

    await createMenuCategory({
      name: 'Main Courses',
      description: 'Entrees',
      display_order: 20
    });

    // Query with proper ordering
    const orderedCategories = await db.select()
      .from(menuCategoriesTable)
      .orderBy(menuCategoriesTable.display_order)
      .execute();

    expect(orderedCategories).toHaveLength(3);
    expect(orderedCategories[0].name).toEqual('Appetizers');
    expect(orderedCategories[0].display_order).toEqual(10);
    expect(orderedCategories[1].name).toEqual('Main Courses');
    expect(orderedCategories[1].display_order).toEqual(20);
    expect(orderedCategories[2].name).toEqual('Desserts');
    expect(orderedCategories[2].display_order).toEqual(30);
  });
});