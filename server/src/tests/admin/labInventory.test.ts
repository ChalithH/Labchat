import request from 'supertest';
import app from '../../app';
import { prisma } from '../..';
import bcrypt from 'bcryptjs';

describe('Lab Inventory Admin Tests', () => {
  let adminUser: any;
  let labManagerA: any;
  let regularMember: any;
  let labA: any;
  let labB: any;
  let globalItem: any;
  let labInventoryItem: any;
  let managerRole: any;
  let studentRole: any;

  let adminAgent: any;
  let managerAgent: any;
  let memberAgent: any;

  beforeAll(async () => {
    const timestamp = Date.now();
    const password = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get existing roles
    const adminRole = await prisma.role.findFirst({ where: { permissionLevel: 100 } });
    const memberRole = await prisma.role.findFirst({ where: { permissionLevel: { lt: 100 } } });
    
    managerRole = await prisma.labRole.findFirst({ where: { permissionLevel: { gte: 70 } } });
    studentRole = await prisma.labRole.findFirst({ 
      where: { permissionLevel: { lte: 30, gte: 0 } },
      orderBy: { permissionLevel: 'asc' }
    });

    if (!adminRole || !memberRole || !managerRole || !studentRole) {
      throw new Error('Required roles not found');
    }

    // Create test users
    adminUser = await prisma.user.create({
      data: {
        roleId: adminRole.id,
        universityId: 'U80001',
        username: `admin_${timestamp}`,
        loginEmail: `admin_${timestamp}@test.com`,
        loginPassword: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        displayName: 'Admin User'
      }
    });

    labManagerA = await prisma.user.create({
      data: {
        roleId: memberRole.id,
        universityId: 'U80002',
        username: `manager_${timestamp}`,
        loginEmail: `manager_${timestamp}@test.com`,
        loginPassword: hashedPassword,
        firstName: 'Lab',
        lastName: 'Manager',
        displayName: 'Lab Manager'
      }
    });

    regularMember = await prisma.user.create({
      data: {
        roleId: memberRole.id,
        universityId: 'U80003',
        username: `member_${timestamp}`,
        loginEmail: `member_${timestamp}@test.com`,
        loginPassword: hashedPassword,
        firstName: 'Regular',
        lastName: 'Member',
        displayName: 'Regular Member'
      }
    });

    // Create test labs
    labA = await prisma.lab.create({
      data: {
        name: `Test Lab A ${timestamp}`,
        location: 'Location A',
        status: 'active'
      }
    });

    labB = await prisma.lab.create({
      data: {
        name: `Test Lab B ${timestamp}`,
        location: 'Location B',
        status: 'active'
      }
    });

    // Create lab memberships
    await prisma.labMember.create({
      data: {
        userId: labManagerA.id,
        labId: labA.id,
        labRoleId: managerRole.id
      }
    });

    await prisma.labMember.create({
      data: {
        userId: regularMember.id,
        labId: labA.id,
        labRoleId: studentRole.id
      }
    });

    // Create test global item
    globalItem = await prisma.item.create({
      data: {
        name: `Test Global Item ${timestamp}`,
        description: 'Test item for lab inventory',
        safetyInfo: null,
        approval: false
      }
    });

    // Create lab inventory item
    labInventoryItem = await prisma.labInventoryItem.create({
      data: {
        itemId: globalItem.id,
        labId: labA.id,
        location: 'Shelf A',
        itemUnit: 'pieces',
        currentStock: 10,
        minStock: 2
      }
    });

    // Create and login agents
    adminAgent = request.agent(app);
    managerAgent = request.agent(app);
    memberAgent = request.agent(app);

    await adminAgent.post('/api/auth/login').send({
      loginEmail: adminUser.loginEmail,
      loginPassword: password
    });

    await managerAgent.post('/api/auth/login').send({
      loginEmail: labManagerA.loginEmail,
      loginPassword: password
    });

    await memberAgent.post('/api/auth/login').send({
      loginEmail: regularMember.loginEmail,
      loginPassword: password
    });
  });

  afterAll(async () => {
    // Clean up test data in proper order
    await prisma.inventoryLog.deleteMany({
      where: {
        userId: { in: [adminUser.id, labManagerA.id, regularMember.id] }
      }
    });

    await prisma.labItemTag.deleteMany({
      where: {
        inventoryItem: {
          labId: { in: [labA.id, labB.id] }
        }
      }
    });

    await prisma.labInventoryItem.deleteMany({
      where: { labId: { in: [labA.id, labB.id] } }
    });

    await prisma.item.deleteMany({
      where: { id: globalItem.id }
    });

    await prisma.labMember.deleteMany({
      where: { labId: { in: [labA.id, labB.id] } }
    });

    await prisma.lab.deleteMany({
      where: { id: { in: [labA.id, labB.id] } }
    });

    await prisma.user.deleteMany({
      where: { id: { in: [adminUser.id, labManagerA.id, regularMember.id] } }
    });

    await prisma.$disconnect();
  });

  describe('POST /api/admin/lab/:labId/inventory', () => {
    it('should allow lab manager to add item to lab inventory', async () => {
      // Create a new global item for this test
      const newGlobalItem = await prisma.item.create({
        data: {
          name: 'Test Item for Lab Inventory',
          description: 'Another test item',
          safetyInfo: null,
          approval: false
        }
      });

      const inventoryData = {
        itemId: newGlobalItem.id,
        location: 'Shelf B',
        itemUnit: 'bottles',
        currentStock: 5,
        minStock: 1
      };

      const response = await managerAgent
        .post(`/api/admin/lab/${labA.id}/inventory`)
        .send(inventoryData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.location).toBe(inventoryData.location);

      // Clean up
      await prisma.labInventoryItem.deleteMany({ where: { id: response.body.id } });
      await prisma.item.deleteMany({ where: { id: newGlobalItem.id } });
    });

    it('should allow admin to add item to lab inventory', async () => {
      // Create a new global item for this test
      const newGlobalItem = await prisma.item.create({
        data: {
          name: 'Admin Test Item',
          description: 'Admin test item',
          safetyInfo: null,
          approval: false
        }
      });

      const inventoryData = {
        itemId: newGlobalItem.id,
        location: 'Admin Shelf',
        itemUnit: 'boxes',
        currentStock: 3,
        minStock: 1
      };

      const response = await adminAgent
        .post(`/api/admin/lab/${labA.id}/inventory`)
        .send(inventoryData)
        .expect(201);

      expect(response.body).toHaveProperty('id');

      // Clean up
      await prisma.labInventoryItem.deleteMany({ where: { id: response.body.id } });
      await prisma.item.deleteMany({ where: { id: newGlobalItem.id } });
    });

    it('should reject regular member', async () => {
      const inventoryData = {
        itemId: globalItem.id,
        location: 'Should not work',
        itemUnit: 'pieces',
        currentStock: 1,
        minStock: 1
      };

      await memberAgent
        .post(`/api/admin/lab/${labA.id}/inventory`)
        .send(inventoryData)
        .expect(403);
    });

    it('should validate required fields', async () => {
      await managerAgent
        .post(`/api/admin/lab/${labA.id}/inventory`)
        .send({ location: 'Missing itemId' })
        .expect(400);
    });
  });

  describe('PUT /api/admin/lab/:labId/inventory/:itemId', () => {
    let testInventoryId: number;

    beforeEach(async () => {
      const inventory = await prisma.labInventoryItem.create({
        data: {
          itemId: globalItem.id,
          labId: labA.id,
          location: 'Update Test Shelf',
          itemUnit: 'pieces',
          currentStock: 8,
          minStock: 2
        }
      });
      testInventoryId = inventory.id;
    });

    afterEach(async () => {
      await prisma.labInventoryItem.deleteMany({
        where: { id: testInventoryId }
      });
    });

    it('should allow lab manager to update inventory item', async () => {
      const updateData = {
        location: 'Updated Location',
        currentStock: 15,
        minStock: 3
      };

      const response = await managerAgent
        .put(`/api/admin/lab/${labA.id}/inventory/${testInventoryId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.location).toBe(updateData.location);
      expect(response.body.currentStock).toBe(updateData.currentStock);
    });

    it('should reject regular member from updating', async () => {
      await memberAgent
        .put(`/api/admin/lab/${labA.id}/inventory/${testInventoryId}`)
        .send({ location: 'Should not work' })
        .expect(403);
    });
  });

  describe('DELETE /api/admin/lab/:labId/inventory/:itemId', () => {
    let testInventoryId: number;

    beforeEach(async () => {
      const inventory = await prisma.labInventoryItem.create({
        data: {
          itemId: globalItem.id,
          labId: labA.id,
          location: 'Delete Test Shelf',
          itemUnit: 'pieces',
          currentStock: 5,
          minStock: 1
        }
      });
      testInventoryId = inventory.id;
    });

    it('should allow lab manager to delete inventory item', async () => {
      await managerAgent
        .delete(`/api/admin/lab/${labA.id}/inventory/${testInventoryId}`)
        .expect(200);

      const deletedItem = await prisma.labInventoryItem.findUnique({
        where: { id: testInventoryId }
      });
      expect(deletedItem).toBeNull();
    });

    it('should allow admin to delete inventory item', async () => {
      await adminAgent
        .delete(`/api/admin/lab/${labA.id}/inventory/${testInventoryId}`)
        .expect(200);
    });

    it('should reject regular member from deleting', async () => {
      await memberAgent
        .delete(`/api/admin/lab/${labA.id}/inventory/${testInventoryId}`)
        .expect(403);
    });
  });

  describe('POST /api/inventory/replenish', () => {
    it('should allow lab manager to replenish stock', async () => {
      const replenishData = {
        itemId: labInventoryItem.id,
        amountAdded: 5,
        labId: labA.id
      };

      const response = await managerAgent
        .post('/api/inventory/replenish')
        .send(replenishData)
        .expect(200);

      expect(response.body).toHaveProperty('currentStock');
    });

    it('should allow regular member to replenish stock', async () => {
      const replenishData = {
        itemId: labInventoryItem.id,
        amountAdded: 3,
        labId: labA.id
      };

      await memberAgent
        .post('/api/inventory/replenish')
        .send(replenishData)
        .expect(200);
    });

    it('should validate required fields', async () => {
      await managerAgent
        .post('/api/inventory/replenish')
        .send({ amountAdded: 5 })
        .expect(400);
    });
  });

  describe('GET /api/inventory/:labId', () => {
    it('should allow lab manager to get lab inventory', async () => {
      const response = await managerAgent
        .get(`/api/inventory/${labA.id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should allow admin to get lab inventory', async () => {
      const response = await adminAgent
        .get(`/api/inventory/${labA.id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should allow regular member to view inventory', async () => {
      const response = await memberAgent
        .get(`/api/inventory/${labA.id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});