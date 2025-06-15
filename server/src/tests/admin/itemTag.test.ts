import request from 'supertest';
import app from '../../app';
import { prisma } from '../..';
import bcrypt from 'bcryptjs';

describe('Item Tag Admin Tests', () => {
  let adminUser: any;
  let labManager: any;
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
        universityId: 'U90001',
        username: `admin_${timestamp}`,
        loginEmail: `admin_${timestamp}@test.com`,
        loginPassword: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        displayName: 'Admin User'
      }
    });

    labManager = await prisma.user.create({
      data: {
        roleId: memberRole.id,
        universityId: 'U90002',
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
        universityId: 'U90003',
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
        userId: labManager.id,
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
        description: 'Test item for tagging',
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
      loginEmail: labManager.loginEmail,
      loginPassword: password
    });

    await memberAgent.post('/api/auth/login').send({
      loginEmail: regularMember.loginEmail,
      loginPassword: password
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.labItemTag.deleteMany({
      where: {
        inventoryItem: {
          labId: { in: [labA.id, labB.id] }
        }
      }
    });

    await prisma.itemTag.deleteMany({});

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
      where: { id: { in: [adminUser.id, labManager.id, regularMember.id] } }
    });

    await prisma.$disconnect();
  });

  describe('POST /api/admin/tags', () => {
    it('should allow admin to create tag', async () => {
      const tagData = {
        name: 'Test Tag',
        description: 'Test description'
      };

      const response = await adminAgent
        .post('/api/admin/tags')
        .send(tagData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(tagData.name);
    });

    it('should allow lab manager to create tag', async () => {
      const tagData = {
        name: 'Manager Tag',
        description: 'Manager description'
      };

      const response = await managerAgent
        .post('/api/admin/tags')
        .send(tagData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should reject regular member', async () => {
      const tagData = {
        name: 'Member Tag',
        description: 'Should not work'
      };

      await memberAgent
        .post('/api/admin/tags')
        .send(tagData)
        .expect(403);
    });

    it('should validate required name field', async () => {
      await adminAgent
        .post('/api/admin/tags')
        .send({ description: 'No name' })
        .expect(400);
    });
  });

  describe('PUT /api/admin/tags/:tagId', () => {
    let testTagId: number;

    beforeEach(async () => {
      const tag = await prisma.itemTag.create({
        data: {
          name: 'Update Test Tag',
          tagDescription: 'Original description'
        }
      });
      testTagId = tag.id;
    });

    afterEach(async () => {
      await prisma.itemTag.deleteMany({
        where: { id: testTagId }
      });
    });

    it('should allow admin to update tag', async () => {
      const updateData = {
        name: 'Updated Tag Name',
        description: 'Updated description'
      };

      const response = await adminAgent
        .put(`/api/admin/tags/${testTagId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
    });

    it('should reject lab manager from updating tag', async () => {
      await managerAgent
        .put(`/api/admin/tags/${testTagId}`)
        .send({ name: 'Should not work' })
        .expect(403);
    });
  });

  describe('DELETE /api/admin/tags/:tagId', () => {
    let testTagId: number;

    beforeEach(async () => {
      const tag = await prisma.itemTag.create({
        data: {
          name: 'Delete Test Tag',
          tagDescription: 'Will be deleted'
        }
      });
      testTagId = tag.id;
    });

    it('should allow admin to delete tag', async () => {
      await adminAgent
        .delete(`/api/admin/tags/${testTagId}`)
        .expect(200);

      const deletedTag = await prisma.itemTag.findUnique({
        where: { id: testTagId }
      });
      expect(deletedTag).toBeNull();
    });

    it('should reject lab manager from deleting tag', async () => {
      await managerAgent
        .delete(`/api/admin/tags/${testTagId}`)
        .expect(403);
    });
  });

  describe('POST /api/admin/lab/:labId/inventory/:itemId/tags', () => {
    let testTagId: number;

    beforeEach(async () => {
      const tag = await prisma.itemTag.create({
        data: {
          name: 'Inventory Tag',
          tagDescription: 'For inventory testing'
        }
      });
      testTagId = tag.id;
    });

    afterEach(async () => {
      await prisma.labItemTag.deleteMany({
        where: { itemTagId: testTagId }
      });
      await prisma.itemTag.deleteMany({
        where: { id: testTagId }
      });
    });

    it('should allow lab manager to add tags to lab inventory', async () => {
      const tagData = {
        tagIds: [testTagId]
      };

      const response = await managerAgent
        .post(`/api/admin/lab/${labA.id}/inventory/${labInventoryItem.id}/tags`)
        .send(tagData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject regular member', async () => {
      const tagData = {
        tagIds: [testTagId]
      };

      await memberAgent
        .post(`/api/admin/lab/${labA.id}/inventory/${labInventoryItem.id}/tags`)
        .send(tagData)
        .expect(403);
    });
  });

  describe('DELETE /api/admin/lab/:labId/inventory/:itemId/tags/:tagId', () => {
    let testTagId: number;

    beforeEach(async () => {
      const tag = await prisma.itemTag.create({
        data: {
          name: 'Remove Tag',
          tagDescription: 'Will be removed from inventory'
        }
      });
      testTagId = tag.id;

      // Add tag to inventory item
      await prisma.labItemTag.create({
        data: {
          inventoryItemId: labInventoryItem.id,
          itemTagId: testTagId
        }
      });
    });

    afterEach(async () => {
      await prisma.labItemTag.deleteMany({
        where: { itemTagId: testTagId }
      });
      await prisma.itemTag.deleteMany({
        where: { id: testTagId }
      });
    });

    it('should allow lab manager to remove tag from inventory', async () => {
      await managerAgent
        .delete(`/api/admin/lab/${labA.id}/inventory/${labInventoryItem.id}/tags/${testTagId}`)
        .expect(200);
    });

    it('should reject regular member', async () => {
      await memberAgent
        .delete(`/api/admin/lab/${labA.id}/inventory/${labInventoryItem.id}/tags/${testTagId}`)
        .expect(403);
    });
  });
});