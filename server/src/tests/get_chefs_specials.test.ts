import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { menuCategoriesTable, menuItemsTable } from '../db/schema';
import { getChefsSpecials } from '../handlers/get_chefs_specials';

describe('getChefsSpecials', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no chef specials exist', async () => {
    const result = await getChefsSpecials();
    expect(result).toEqual([]);
  });

  it('should fetch all chef specials', async () => {
    // Create test category
    const categoryResult = await db.insert(menuCategoriesTable)
      .values({
        name: 'Main Courses',
        description: 'Our signature main dishes',
        display_order: 1
      })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create test menu items - mix of regular and chef's specials
    await db.insert(menuItemsTable)
      .values([
        {
          category_id: categoryId,
          name: 'Signature Ribeye',
          description: 'Premium aged ribeye steak',
          ingredients: 'Ribeye steak, herbs, garlic',
          preparation_info: 'Grilled to perfection',
          price: '45.99',
          is_chefs_special: true,
          display_order: 1
        },
        {
          category_id: categoryId,
          name: 'Regular Pasta',
          description: 'Basic pasta dish',
          ingredients: 'Pasta, tomato sauce',
          preparation_info: 'Boiled and served',
          price: '18.99',
          is_chefs_special: false,
          display_order: 2
        },
        {
          category_id: categoryId,
          name: 'Chef\'s Salmon',
          description: 'Pan-seared Atlantic salmon',
          ingredients: 'Fresh salmon, lemon, dill',
          preparation_info: 'Pan-seared with herbs',
          price: '32.50',
          is_chefs_special: true,
          display_order: 3
        }
      ])
      .execute();

    const result = await getChefsSpecials();

    expect(result).toHaveLength(2);
    
    // Verify only chef's specials are returned
    result.forEach(item => {
      expect(item.is_chefs_special).toBe(true);
    });

    // Check specific items
    const ribeye = result.find(item => item.name === 'Signature Ribeye');
    const salmon = result.find(item => item.name === 'Chef\'s Salmon');

    expect(ribeye).toBeDefined();
    expect(ribeye?.price).toEqual(45.99);
    expect(typeof ribeye?.price).toBe('number');
    expect(ribeye?.description).toEqual('Premium aged ribeye steak');

    expect(salmon).toBeDefined();
    expect(salmon?.price).toEqual(32.50);
    expect(typeof salmon?.price).toBe('number');
    expect(salmon?.description).toEqual('Pan-seared Atlantic salmon');
  });

  it('should order results by display_order and created_at descending', async () => {
    // Create test category
    const categoryResult = await db.insert(menuCategoriesTable)
      .values({
        name: 'Specials',
        description: 'Chef specials',
        display_order: 1
      })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create chef's specials with different display orders
    await db.insert(menuItemsTable)
      .values([
        {
          category_id: categoryId,
          name: 'First Special',
          description: 'First chef special',
          ingredients: 'Various ingredients',
          preparation_info: 'Special preparation',
          price: '25.99',
          is_chefs_special: true,
          display_order: 5
        },
        {
          category_id: categoryId,
          name: 'Second Special',
          description: 'Second chef special',
          ingredients: 'Various ingredients',
          preparation_info: 'Special preparation',
          price: '35.99',
          is_chefs_special: true,
          display_order: 10
        },
        {
          category_id: categoryId,
          name: 'Third Special',
          description: 'Third chef special',
          ingredients: 'Various ingredients',
          preparation_info: 'Special preparation',
          price: '20.99',
          is_chefs_special: true,
          display_order: 3
        }
      ])
      .execute();

    const result = await getChefsSpecials();

    expect(result).toHaveLength(3);
    
    // Should be ordered by display_order descending (highest first)
    expect(result[0].name).toEqual('Second Special'); // display_order: 10
    expect(result[0].display_order).toEqual(10);
    expect(result[1].name).toEqual('First Special');  // display_order: 5
    expect(result[1].display_order).toEqual(5);
    expect(result[2].name).toEqual('Third Special');  // display_order: 3
    expect(result[2].display_order).toEqual(3);
  });

  it('should only include items from active categories', async () => {
    // Create active and inactive categories
    const activeCategory = await db.insert(menuCategoriesTable)
      .values({
        name: 'Active Category',
        description: 'Active category',
        display_order: 1,
        is_active: true
      })
      .returning()
      .execute();

    const inactiveCategory = await db.insert(menuCategoriesTable)
      .values({
        name: 'Inactive Category',
        description: 'Inactive category',
        display_order: 2,
        is_active: false
      })
      .returning()
      .execute();

    // Create chef's specials in both categories
    await db.insert(menuItemsTable)
      .values([
        {
          category_id: activeCategory[0].id,
          name: 'Active Special',
          description: 'Special from active category',
          ingredients: 'Fresh ingredients',
          preparation_info: 'Carefully prepared',
          price: '29.99',
          is_chefs_special: true,
          display_order: 1
        },
        {
          category_id: inactiveCategory[0].id,
          name: 'Inactive Special',
          description: 'Special from inactive category',
          ingredients: 'Fresh ingredients',
          preparation_info: 'Carefully prepared',
          price: '35.99',
          is_chefs_special: true,
          display_order: 1
        }
      ])
      .execute();

    const result = await getChefsSpecials();

    // Should only return specials from active categories
    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Active Special');
    expect(result[0].category_id).toEqual(activeCategory[0].id);
  });

  it('should handle numeric price conversion correctly', async () => {
    // Create test category
    const categoryResult = await db.insert(menuCategoriesTable)
      .values({
        name: 'Test Category',
        description: 'Test category',
        display_order: 1
      })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create chef's special with decimal price
    await db.insert(menuItemsTable)
      .values({
        category_id: categoryId,
        name: 'Decimal Price Special',
        description: 'Special with decimal price',
        ingredients: 'Premium ingredients',
        preparation_info: 'Expertly prepared',
        price: '123.45', // Stored as string in database
        is_chefs_special: true,
        display_order: 1
      })
      .execute();

    const result = await getChefsSpecials();

    expect(result).toHaveLength(1);
    expect(result[0].price).toEqual(123.45);
    expect(typeof result[0].price).toBe('number');
  });

  it('should include all required fields in response', async () => {
    // Create test category
    const categoryResult = await db.insert(menuCategoriesTable)
      .values({
        name: 'Complete Test',
        description: 'Complete field test',
        display_order: 1
      })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create chef's special with all fields
    await db.insert(menuItemsTable)
      .values({
        category_id: categoryId,
        name: 'Complete Special',
        description: 'Complete chef special with all fields',
        ingredients: 'Premium beef, truffle oil, seasonal vegetables',
        preparation_info: 'Slow-cooked for 4 hours with special seasoning',
        price: '89.99',
        image_url: 'https://example.com/special.jpg',
        is_chefs_special: true,
        is_available: true,
        dietary_info: 'gluten-free,high-protein',
        display_order: 1
      })
      .execute();

    const result = await getChefsSpecials();

    expect(result).toHaveLength(1);
    const special = result[0];

    // Verify all fields are present and correct
    expect(special.id).toBeDefined();
    expect(special.category_id).toEqual(categoryId);
    expect(special.name).toEqual('Complete Special');
    expect(special.description).toEqual('Complete chef special with all fields');
    expect(special.ingredients).toEqual('Premium beef, truffle oil, seasonal vegetables');
    expect(special.preparation_info).toEqual('Slow-cooked for 4 hours with special seasoning');
    expect(special.price).toEqual(89.99);
    expect(special.image_url).toEqual('https://example.com/special.jpg');
    expect(special.is_chefs_special).toBe(true);
    expect(special.is_available).toBe(true);
    expect(special.dietary_info).toEqual('gluten-free,high-protein');
    expect(special.display_order).toEqual(1);
    expect(special.created_at).toBeInstanceOf(Date);
    expect(special.updated_at).toBeInstanceOf(Date);
  });
});