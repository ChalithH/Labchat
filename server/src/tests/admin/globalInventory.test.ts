import request from 'supertest';
import app from '../../app';
import { prisma } from '../..';
import bcrypt from 'bcryptjs';

describe('Admin Global Inventory Tests', () => {
  let adminUser: any, labManager: any, member: any;
  let lab: any;
  let adminAgent: ReturnType<typeof request.agent>;
  let managerAgent: ReturnType<typeof request.agent>;
  let memberAgent: ReturnType<typeof request.agent>;
  let createdItemIds: number[] = [];

  beforeAll(async () => {
    const timestamp = Date.now();
    const password = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get roles
    const adminRole = await prisma.role.findFirst({ where: { permissionLevel: 100 } });
    const memberRole = await prisma.role.findFirst({ where: { permissionLevel: { lt: 100 } } });
    const managerRole = await prisma.labRole.findFirst({ where: { permissionLevel: { gte: 70 } } });
    const studentRole = await prisma.labRole.findFirst({ 
      where: { permissionLevel: { lte: 30, gte: 0 } },
      orderBy: { permissionLevel: 'asc' }
    });

    if (!adminRole || !memberRole || !managerRole || !studentRole) {
      throw new Error('Required roles not found');
    }

    // Create users
    adminUser = await prisma.user.create({
      data: {
        roleId: adminRole.id,
        universityId: 'U50001',
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
        universityId: 'U50002',
        username: `manager_${timestamp}`,
        loginEmail: `manager_${timestamp}@test.com`,
        loginPassword: hashedPassword,
        firstName: 'Lab',
        lastName: 'Manager',
        displayName: 'Lab Manager'
      }
    });

    member = await prisma.user.create({
      data: {
        roleId: memberRole.id,
        universityId: 'U50003',
        username: `member_${timestamp}`,
        loginEmail: `member_${timestamp}@test.com`,
        loginPassword: hashedPassword,
        firstName: 'Regular',
        lastName: 'Member',
        displayName: 'Regular Member'
      }
    });

    // Create lab and memberships
    lab = await prisma.lab.create({
      data: {
        name: `Test Lab ${timestamp}`,
        location: 'Test Location',
        status: 'active'
      }
    });

    await prisma.labMember.createMany({
      data: [
        { userId: labManager.id, labId: lab.id, labRoleId: managerRole.id },
        { userId: member.id, labId: lab.id, labRoleId: studentRole.id }
      ]
    });

    // Setup agents
    adminAgent = request.agent(app);
    managerAgent = request.agent(app);
    memberAgent = request.agent(app);

    await Promise.all([
      adminAgent.post('/api/auth/login').send({ loginEmail: adminUser.loginEmail, loginPassword: password }),
      managerAgent.post('/api/auth/login').send({ loginEmail: labManager.loginEmail, loginPassword: password }),
      memberAgent.post('/api/auth/login').send({ loginEmail: member.loginEmail, loginPassword: password })
    ]);
  });

  afterAll(async () => {
    await prisma.labInventoryItem.deleteMany({ where: { labId: lab.id } });
    await prisma.labMember.deleteMany({ where: { labId: lab.id } });
    await prisma.lab.deleteMany({ where: { id: lab.id } });
    await prisma.item.deleteMany({ where: { id: { in: createdItemIds } } });
    await prisma.user.deleteMany({ where: { id: { in: [adminUser.id, labManager.id, member.id] } } });
    await prisma.$disconnect();
  });

  describe('GET /api/admin/get-all-items', () => {
    it('should allow admin access, reject others', async () => {
      const adminResponse = await adminAgent.get('/api/admin/get-all-items').expect(200);
      expect(Array.isArray(adminResponse.body)).toBe(true);

      await Promise.all([
        managerAgent.get('/api/admin/get-all-items').expect(403),
        memberAgent.get('/api/admin/get-all-items').expect(403)
      ]);
    });
  });

  describe('GET /api/admin/get-available-items-for-lab/:labId', () => {
    it('should allow admin and lab manager access', async () => {
      const [adminRes, managerRes] = await Promise.all([
        adminAgent.get(`/api/admin/get-available-items-for-lab/${lab.id}`).expect(200),
        managerAgent.get(`/api/admin/get-available-items-for-lab/${lab.id}`).expect(200)
      ]);

      expect(Array.isArray(adminRes.body)).toBe(true);
      expect(Array.isArray(managerRes.body)).toBe(true);

      // Member cannot access
      await memberAgent.get(`/api/admin/get-available-items-for-lab/${lab.id}`).expect(403);
    });

    it('should return 404 for non-existent lab', async () => {
      await adminAgent.get('/api/admin/get-available-items-for-lab/99999').expect(404);
    });
  });

  describe('POST /api/admin/create-global-item', () => {
    afterEach(async () => {
      // Clean up any items created in tests
      const itemsToDelete = await prisma.item.findMany({
        where: { name: { contains: 'Test Item' } }
      });
      const idsToDelete = itemsToDelete.map(item => item.id);
      await prisma.item.deleteMany({ where: { id: { in: idsToDelete } } });
      createdItemIds.push(...idsToDelete);
    });

    it('should allow admin to create item, reject others', async () => {
      const itemData = { name: `Test Item ${Date.now()}`, description: 'Test', approval: true };

      // Admin can create
      const adminResponse = await adminAgent
        .post('/api/admin/create-global-item')
        .send(itemData)
        .expect(201);
      
      expect(adminResponse.body).toHaveProperty('id');
      expect(adminResponse.body.name).toBe(itemData.name);

      // Others cannot create
      await Promise.all([
        managerAgent.post('/api/admin/create-global-item').send(itemData).expect(403),
        memberAgent.post('/api/admin/create-global-item').send(itemData).expect(403)
      ]);
    });

    it('should validate required name field', async () => {
      await adminAgent
        .post('/api/admin/create-global-item')
        .send({ description: 'Missing name' })
        .expect(400);
    });
  });

  describe('PUT /api/admin/update-item/:id', () => {
    let testItem: any;

    beforeEach(async () => {
      testItem = await prisma.item.create({
        data: { name: `Update Test ${Date.now()}`, description: 'Original', approval: false }
      });
      createdItemIds.push(testItem.id);
    });

    it('should allow admin to update, reject others', async () => {
      const updateData = { name: 'Updated Name', approval: true };

      // Admin can update
      const adminResponse = await adminAgent
        .put(`/api/admin/update-item/${testItem.id}`)
        .send(updateData)
        .expect(200);
      expect(adminResponse.body.name).toBe(updateData.name);

      // Others cannot update
      await Promise.all([
        managerAgent.put(`/api/admin/update-item/${testItem.id}`).send(updateData).expect(403),
        memberAgent.put(`/api/admin/update-item/${testItem.id}`).send(updateData).expect(403)
      ]);
    });

    it('should return 404 for non-existent item', async () => {
      await adminAgent.put('/api/admin/update-item/99999').send({ name: 'Test' }).expect(404);
    });
  });

  describe('DELETE /api/admin/delete-item/:id', () => {
    let testItem: any;

    beforeEach(async () => {
      testItem = await prisma.item.create({
        data: { name: `Delete Test ${Date.now()}`, description: 'Will be deleted' }
      });
    });

    it('should allow admin to delete, reject others', async () => {
      // Others cannot delete
      await Promise.all([
        managerAgent.delete(`/api/admin/delete-item/${testItem.id}`).expect(403),
        memberAgent.delete(`/api/admin/delete-item/${testItem.id}`).expect(403)
      ]);

      // Admin can delete
      await adminAgent.delete(`/api/admin/delete-item/${testItem.id}`).expect(200);

      // Verify deletion
      const deleted = await prisma.item.findUnique({ where: { id: testItem.id } });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent item', async () => {
      await adminAgent.delete('/api/admin/delete-item/99999').expect(404);
    });
  });

  describe('Item Lifecycle Integration', () => {
    it('should support complete CRUD operations', async () => {
      // Create
      const createData = { name: `Lifecycle Test ${Date.now()}`, description: 'Test', approval: false };
      const createResponse = await adminAgent
        .post('/api/admin/create-global-item')
        .send(createData)
        .expect(201);
      const itemId = createResponse.body.id;

      // Update
      const updateData = { name: 'Updated Lifecycle', approval: true };
      const updateResponse = await adminAgent
        .put(`/api/admin/update-item/${itemId}`)
        .send(updateData)
        .expect(200);
      expect(updateResponse.body.name).toBe(updateData.name);

      // Verify in list
      const getAllResponse = await adminAgent.get('/api/admin/get-all-items').expect(200);
      const foundItem = getAllResponse.body.find((item: any) => item.id === itemId);
      expect(foundItem).toBeDefined();
      expect(foundItem.name).toBe(updateData.name);

      // Delete
      await adminAgent.delete(`/api/admin/delete-item/${itemId}`).expect(200);

      // Verify deletion
      const deleted = await prisma.item.findUnique({ where: { id: itemId } });
      expect(deleted).toBeNull();
    });
  });
});