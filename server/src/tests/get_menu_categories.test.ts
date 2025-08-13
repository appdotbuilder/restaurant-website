import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { menuCategoriesTable } from '../db/schema';
import { type CreateMenuCategoryInput } from '../schema';
import { getMenuCategories } from '../handlers/get_menu_categories';

// Test category data
const testCategories: CreateMenuCategoryInput[] = [
  {
    name: 'Appetizers',
    description: 'Start your meal with our delicious appetizers',
    display_order: 1
  },
  {
    name: 'Main Courses',
    description: 'Hearty main dishes',
    display_order: 2
  },
  {
    name: 'Desserts',
    description: 'Sweet endings to your meal',
    display_order: 3
  },
  {
    name: 'Beverages',
    description: null, // Test nullable description
    display_order: 4
  }
];

describe('getMenuCategories', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no categories exist', async () => {
    const result = await getMenuCategories();

    expect(result).toEqual([]);
  });

  it('should return active categories ordered by display_order', async () => {
    // Insert test categories
    await db.insert(menuCategoriesTable)
      .values(testCategories)
      .execute();

    const result = await getMenuCategories();

    expect(result).toHaveLength(4);
    
    // Check ordering by display_order
    expect(result[0].name).toEqual('Appetizers');
    expect(result[1].name).toEqual('Main Courses');
    expect(result[2].name).toEqual('Desserts');
    expect(result[3].name).toEqual('Beverages');

    // Verify all required fields are present
    result.forEach(category => {
      expect(category.id).toBeDefined();
      expect(category.name).toBeDefined();
      expect(typeof category.display_order).toBe('number');
      expect(typeof category.is_active).toBe('boolean');
      expect(category.created_at).toBeInstanceOf(Date);
    });
  });

  it('should only return active categories', async () => {
    // Insert mix of active and inactive categories
    await db.insert(menuCategoriesTable)
      .values([
        {
          name: 'Active Category',
          description: 'This should appear',
          display_order: 1,
          is_active: true
        },
        {
          name: 'Inactive Category',
          description: 'This should not appear',
          display_order: 2,
          is_active: false
        }
      ])
      .execute();

    const result = await getMenuCategories();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Active Category');
    expect(result[0].is_active).toBe(true);
  });

  it('should handle categories with null descriptions', async () => {
    await db.insert(menuCategoriesTable)
      .values([{
        name: 'No Description Category',
        description: null,
        display_order: 1
      }])
      .execute();

    const result = await getMenuCategories();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('No Description Category');
    expect(result[0].description).toBeNull();
  });

  it('should order categories correctly even with gaps in display_order', async () => {
    // Insert categories with non-sequential display orders
    await db.insert(menuCategoriesTable)
      .values([
        {
          name: 'Third',
          description: 'Should be third',
          display_order: 10
        },
        {
          name: 'First',
          description: 'Should be first',
          display_order: 1
        },
        {
          name: 'Second',
          description: 'Should be second',
          display_order: 5
        }
      ])
      .execute();

    const result = await getMenuCategories();

    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('First');
    expect(result[1].name).toEqual('Second');
    expect(result[2].name).toEqual('Third');

    // Verify display_order values are preserved
    expect(result[0].display_order).toEqual(1);
    expect(result[1].display_order).toEqual(5);
    expect(result[2].display_order).toEqual(10);
  });

  it('should handle same display_order values consistently', async () => {
    // Insert categories with same display_order (edge case)
    await db.insert(menuCategoriesTable)
      .values([
        {
          name: 'Category A',
          description: 'First with same order',
          display_order: 1
        },
        {
          name: 'Category B',
          description: 'Second with same order',
          display_order: 1
        }
      ])
      .execute();

    const result = await getMenuCategories();

    expect(result).toHaveLength(2);
    // Both should have display_order of 1
    expect(result[0].display_order).toEqual(1);
    expect(result[1].display_order).toEqual(1);
    // Names should be either A then B or B then A (database dependent)
    const names = result.map(c => c.name).sort();
    expect(names).toEqual(['Category A', 'Category B']);
  });
});