import { prisma } from '../../prisma';
import request from 'supertest';
import app from '../../app';
import bcrypt from 'bcryptjs';

describe('Inventory Controllers', () => {
  // Test data IDs that should exist in production seed data
  let testLabId: number;
  let testUserId: number;
  let testMemberId: number;
  let testInventoryItemId: number;
  let testItemId: number;
  let testTagId: number;
  let createdInventoryItemId: number;
  let testUser: any;
  let agent = request.agent(app);

  beforeAll(async () => {
    // Create and login a test user for authentication
    const timestamp = Date.now();
    const plainPassword = 'SecurePassword123!';

    testUser = {
      roleId: 2, // Assuming role 2 has appropriate permissions
      universityId: `U${timestamp}`,
      username: `inventorytest_${timestamp}`,
      loginEmail: `inventorytest_${timestamp}@test.com`,
      loginPassword: plainPassword,
      firstName: 'Inventory',
      lastName: 'Tester',
      displayName: 'Inventory Tester',
      jobTitle: 'Test User',
      office: 'Test Lab',
      bio: 'Test user for inventory operations',
    };

    // Clean up any existing test user
    await prisma.user.deleteMany({ where: { loginEmail: testUser.loginEmail } });

    const hashedPassword = await bcrypt.hash(testUser.loginPassword, 10);

    const createdUser = await prisma.user.create({
      data: {
        roleId: testUser.roleId,
        universityId: testUser.universityId,
        username: testUser.username,
        loginEmail: testUser.loginEmail,
        loginPassword: hashedPassword,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        displayName: testUser.displayName,
        jobTitle: testUser.jobTitle,
        office: testUser.office,
        bio: testUser.bio,
      }
    });

    testUserId = createdUser.id;

    // Get test data from seeded production data
    const lab = await prisma.lab.findFirst();
    const inventoryItem = await prisma.labInventoryItem.findFirst({
      include: { item: true }
    });
    const itemTag = await prisma.itemTag.findFirst();

    if (!lab || !inventoryItem || !itemTag) {
      throw new Error('Required seed data not found');
    }

    testLabId = lab.id;
    testInventoryItemId = inventoryItem.id;
    testItemId = inventoryItem.item.id;
    testTagId = itemTag.id;

    // Create a lab member for the test user if needed
    const existingMember = await prisma.labMember.findFirst({
      where: { userId: testUserId, labId: testLabId }
    });

    if (!existingMember) {
      const labRole = await prisma.labRole.findFirst({
        where: { permissionLevel: { gte: 1 } } // Get a role with basic permissions
      });

      if (labRole) {
        const member = await prisma.labMember.create({
          data: {
            userId: testUserId,
            labId: testLabId,
            labRoleId: labRole.id
          }
        });
        testMemberId = member.id;
      }
    } else {
      testMemberId = existingMember.id;
    }

    // Login the test user
    await agent.post('/api/auth/login').send({
      loginEmail: testUser.loginEmail,
      loginPassword: testUser.loginPassword,
    });
  });

  afterAll(async () => {
    // Clean up test user and member
    if (testMemberId) {
      try {
        await prisma.labMember.delete({ where: { id: testMemberId } });
      } catch (error) {
        // Member might not exist
      }
    }
    
    if (testUser?.loginEmail) {
      try {
        // Delete any inventory logs that reference this user first
        await prisma.inventoryLog.deleteMany({ where: { userId: testUserId } });
        // Then delete the user
        await prisma.user.deleteMany({ where: { loginEmail: testUser.loginEmail } });
      } catch (error) {
        console.log('Error cleaning up test user:', error);
      }
    }
  });

  afterEach(async () => {
    // Clean up any test inventory items created during tests
    if (createdInventoryItemId) {
      try {
        await prisma.labInventoryItem.delete({ 
          where: { id: createdInventoryItemId } 
        });
      } catch (error) {
        // Item might not exist or already deleted
      }
      createdInventoryItemId = 0;
    }
  });

  describe('Inventory Retrieval', () => {
    test('should get all inventory items for a lab', async () => {
      const response = await agent
        .get(`/api/inventory/${testLabId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const item = response.body[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('labId');
        expect(item).toHaveProperty('location');
        expect(item).toHaveProperty('itemUnit');
        expect(item).toHaveProperty('currentStock');
        expect(item).toHaveProperty('minStock');
        expect(item).toHaveProperty('item');
        expect(item).toHaveProperty('itemTags');
        expect(Array.isArray(item.itemTags)).toBe(true);
      }
    });

    test('should return empty array for lab with no inventory', async () => {
      // Find a lab with no inventory or use a non-existent lab ID
      const response = await agent
        .get('/api/inventory/99999')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    test('should get all item tags', async () => {
      const response = await agent
        .get('/api/inventory/item-tags')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const tag = response.body[0];
        expect(tag).toHaveProperty('id');
        expect(tag).toHaveProperty('name');
        expect(tag).toHaveProperty('tagDescription');
      }
    });

    test('should get inventory item by name', async () => {
      // First get an existing item name
      const existingItem = await prisma.labInventoryItem.findFirst({
        include: { item: true }
      });

      if (existingItem && existingItem.item) {
        const response = await agent
          .get(`/api/inventory/name/${existingItem.item.name}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
          const item = response.body[0];
          expect(item).toHaveProperty('id');
          expect(item).toHaveProperty('item');
          expect(item.item.name).toContain(existingItem.item.name);
        }
      }
    });

    test('should return empty array for non-existent item name', async () => {
      const response = await agent
        .get('/api/inventory/name/NonExistentItemName123')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    test('should get all local inventory items', async () => {
      const response = await agent
        .get('/api/inventory/local')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const item = response.body[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('labId');
        expect(item).toHaveProperty('currentStock');
        expect(item).toHaveProperty('minStock');
      }
    });

    test('should get low stock items', async () => {
      const response = await agent
        .get('/api/inventory/low-stock')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Each item should have currentStock <= minStock
      response.body.forEach((item: any) => {
        expect(item.currentStock).toBeLessThanOrEqual(item.minStock);
      });
    });
  });

  describe('Inventory Stock Management', () => {
    test('should take items from inventory', async () => {
      // First get an item with sufficient stock
      const itemWithStock = await prisma.labInventoryItem.findFirst({
        where: {
          currentStock: { gt: 5 }, // Item with more than 5 in stock
          labId: testLabId
        }
      });

      if (itemWithStock) {
        const initialStock = itemWithStock.currentStock;
        const amountToTake = 2;

        const response = await agent
          .post('/api/inventory/take')
          .send({
            itemId: itemWithStock.id,
            amountTaken: amountToTake,
            labId: testLabId
          })
          .expect(200);

        expect(response.body).toHaveProperty('id', itemWithStock.id);
        expect(response.body.currentStock).toBe(initialStock - amountToTake);
        expect(response.body).toHaveProperty('updatedAt');

        // Restore the stock for other tests
        await prisma.labInventoryItem.update({
          where: { id: itemWithStock.id },
          data: { currentStock: initialStock }
        });
      }
    });

    test('should return 400 when trying to take more items than available', async () => {
      const itemWithLimitedStock = await prisma.labInventoryItem.findFirst({
        where: {
          currentStock: { lt: 10 }, // Item with less than 10 in stock
          labId: testLabId
        }
      });

      if (itemWithLimitedStock) {
        const response = await agent
          .post('/api/inventory/take')
          .send({
            itemId: itemWithLimitedStock.id,
            amountTaken: itemWithLimitedStock.currentStock + 5, // More than available
            labId: testLabId
          })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Not enough stock available');
      }
    });

    test('should return 404 when trying to take from non-existent item', async () => {
      const response = await agent
        .post('/api/inventory/take')
        .send({
          itemId: 99999, // Non-existent item
          amountTaken: 1,
          labId: testLabId
        })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Item not found in this lab');
    });

    test('should return 400 when labId is missing in take request', async () => {
      const response = await agent
        .post('/api/inventory/take')
        .send({
          itemId: testInventoryItemId,
          amountTaken: 1
          // Missing labId
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'labId is required');
    });

    test('should replenish stock for an item', async () => {
      const itemToReplenish = await prisma.labInventoryItem.findFirst({
        where: { labId: testLabId }
      });

      if (itemToReplenish) {
        const initialStock = itemToReplenish.currentStock;
        const amountToAdd = 5;

        const response = await agent
          .post('/api/inventory/replenish')
          .send({
            itemId: itemToReplenish.id,
            amountAdded: amountToAdd,
            labId: testLabId
          })
          .expect(200);

        expect(response.body).toHaveProperty('id', itemToReplenish.id);
        expect(response.body.currentStock).toBe(initialStock + amountToAdd);
        expect(response.body).toHaveProperty('updatedAt');

        // Restore the stock for other tests
        await prisma.labInventoryItem.update({
          where: { id: itemToReplenish.id },
          data: { currentStock: initialStock }
        });
      }
    });

    test('should handle negative amounts in replenish by taking absolute value', async () => {
      const itemToReplenish = await prisma.labInventoryItem.findFirst({
        where: { labId: testLabId }
      });

      if (itemToReplenish) {
        const initialStock = itemToReplenish.currentStock;
        const negativeAmount = -3;

        const response = await agent
          .post('/api/inventory/replenish')
          .send({
            itemId: itemToReplenish.id,
            amountAdded: negativeAmount,
            labId: testLabId
          })
          .expect(200);

        // Should add the absolute value (3)
        expect(response.body.currentStock).toBe(initialStock + Math.abs(negativeAmount));

        // Restore the stock
        await prisma.labInventoryItem.update({
          where: { id: itemToReplenish.id },
          data: { currentStock: initialStock }
        });
      }
    });

    test('should return 404 when trying to replenish non-existent item', async () => {
      const response = await agent
        .post('/api/inventory/replenish')
        .send({
          itemId: 99999, // Non-existent item
          amountAdded: 5,
          labId: testLabId
        })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Item not found in this lab');
    });

    test('should return 400 when labId is missing in replenish request', async () => {
      const response = await agent
        .post('/api/inventory/replenish')
        .send({
          itemId: testInventoryItemId,
          amountAdded: 5
          // Missing labId
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'labId is required');
    });
  });

  describe('Data Validation and Edge Cases', () => {

    test('should handle case-insensitive search in item name lookup', async () => {
      const existingItem = await prisma.labInventoryItem.findFirst({
        include: { item: true }
      });

      if (existingItem && existingItem.item) {
        // Test with uppercase version of the name
        const upperCaseName = existingItem.item.name.toUpperCase();
        
        const response = await agent
          .get(`/api/inventory/name/${upperCaseName}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
          expect(response.body[0].item.name.toLowerCase()).toContain(
            existingItem.item.name.toLowerCase()
          );
        }
      }
    });

    test('should handle partial name matching in item search', async () => {
      const existingItem = await prisma.labInventoryItem.findFirst({
        include: { item: true }
      });

      if (existingItem && existingItem.item && existingItem.item.name.length > 3) {
        // Test with partial name (first 3 characters)
        const partialName = existingItem.item.name.substring(0, 3);
        
        const response = await agent
          .get(`/api/inventory/name/${partialName}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        // Should find items that contain the partial name
        response.body.forEach((item: any) => {
          expect(item.item.name.toLowerCase()).toContain(partialName.toLowerCase());
        });
      }
    });

    test('should handle zero amount in take operation', async () => {
      const response = await agent
        .post('/api/inventory/take')
        .send({
          itemId: testInventoryItemId,
          amountTaken: 0,
          labId: testLabId
        })
        .expect(200);

      // Taking 0 should not change the stock
      expect(response.body).toHaveProperty('id');
    });

    test('should handle zero amount in replenish operation', async () => {
      const itemToTest = await prisma.labInventoryItem.findFirst({
        where: { labId: testLabId }
      });

      if (itemToTest) {
        const initialStock = itemToTest.currentStock;

        const response = await agent
          .post('/api/inventory/replenish')
          .send({
            itemId: itemToTest.id,
            amountAdded: 0,
            labId: testLabId
          })
          .expect(200);

        // Adding 0 should not change the stock
        expect(response.body.currentStock).toBe(initialStock);
      }
    });
  });

  describe('Response Format Validation', () => {
    test('should return properly formatted inventory items', async () => {
      const response = await agent
        .get(`/api/inventory/${testLabId}`)
        .expect(200);

      if (response.body.length > 0) {
        const item = response.body[0];
        
        // Check all required properties exist
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('labId');
        expect(item).toHaveProperty('location');
        expect(item).toHaveProperty('itemUnit');
        expect(item).toHaveProperty('currentStock');
        expect(item).toHaveProperty('minStock');
        expect(item).toHaveProperty('item');
        expect(item).toHaveProperty('itemTags');

        // Check property types
        expect(typeof item.id).toBe('number');
        expect(typeof item.currentStock).toBe('number');
        expect(typeof item.minStock).toBe('number');
        expect(typeof item.location).toBe('string');
        expect(typeof item.itemUnit).toBe('string');
        expect(Array.isArray(item.itemTags)).toBe(true);

        // Check item object structure
        expect(item.item).toHaveProperty('id');
        expect(item.item).toHaveProperty('name');

        // Check item tags structure
        if (item.itemTags.length > 0) {
          const tag = item.itemTags[0];
          expect(tag).toHaveProperty('id');
          expect(tag).toHaveProperty('name');
          expect(tag).toHaveProperty('description');
        }
      }
    });

    test('should return properly formatted item tags', async () => {
      const response = await agent
        .get('/api/inventory/item-tags')
        .expect(200);

      if (response.body.length > 0) {
        const tag = response.body[0];
        
        expect(tag).toHaveProperty('id');
        expect(tag).toHaveProperty('name');
        expect(tag).toHaveProperty('tagDescription');
        
        expect(typeof tag.id).toBe('number');
        expect(typeof tag.name).toBe('string');
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully in inventory retrieval', async () => {
      // This test might need to be adjusted based on your error handling
      const response = await agent
        .get('/api/inventory/999999999') // Very large number that might cause issues
        .expect(200); // Assuming it returns empty array rather than error

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should handle malformed request bodies in take operation', async () => {
      const response = await agent
        .post('/api/inventory/take')
        .send({
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle malformed request bodies in replenish operation', async () => {
      const response = await agent
        .post('/api/inventory/replenish')
        .send({
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Authentication and Authorization', () => {
    test('should require authentication for stock operations', async () => {
      // Test without authentication (using regular request instead of agent)
      const response = await request(app)
        .post('/api/inventory/take')
        .send({
          itemId: testInventoryItemId,
          amountTaken: 1,
          labId: testLabId
        })
        .expect(401);

      expect(response.body).toHaveProperty('msg', 'Authentication required');
    });

    test('should require authentication for replenish operations', async () => {
      // Test without authentication
      const response = await request(app)
        .post('/api/inventory/replenish')
        .send({
          itemId: testInventoryItemId,
          amountAdded: 1,
          labId: testLabId
        })
        .expect(401);

      expect(response.body).toHaveProperty('msg', 'Authentication required');
    });
  });
});