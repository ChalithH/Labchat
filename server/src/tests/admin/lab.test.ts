import request from 'supertest';
import app from '../../app';
import { prisma } from '../..';
import bcrypt from 'bcryptjs';

describe('Admin Lab Management Tests', () => {
  let adminUser: any, labManager: any, member: any;
  let testLab: any;
  let adminAgent: ReturnType<typeof request.agent>;
  let managerAgent: ReturnType<typeof request.agent>;
  let memberAgent: ReturnType<typeof request.agent>;
  let createdLabIds: number[] = [];

  beforeAll(async () => {
    const timestamp = Date.now();
    const password = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get roles
    const adminRole = await prisma.role.findFirst({ where: { permissionLevel: 100 } });
    const memberRole = await prisma.role.findFirst({ where: { permissionLevel: { lt: 100 } } });
    const managerRole = await prisma.labRole.findFirst({ where: { permissionLevel: { gte: 70 } } });

    if (!adminRole || !memberRole || !managerRole) {
      throw new Error('Required roles not found');
    }

    // Create users
    adminUser = await prisma.user.create({
      data: {
        roleId: adminRole.id,
        universityId: 'U20001',
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
        universityId: 'U20002',
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
        universityId: 'U20003',
        username: `member_${timestamp}`,
        loginEmail: `member_${timestamp}@test.com`,
        loginPassword: hashedPassword,
        firstName: 'Regular',
        lastName: 'Member',
        displayName: 'Regular Member'
      }
    });

    // Create test lab
    testLab = await prisma.lab.create({
      data: {
        name: `Test Lab ${timestamp}`,
        location: 'Test Location',
        status: 'active'
      }
    });

    // Make lab manager a member of the test lab
    await prisma.labMember.create({
      data: {
        userId: labManager.id,
        labId: testLab.id,
        labRoleId: managerRole.id
      }
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
    await prisma.labMember.deleteMany({ where: { labId: testLab.id } });
    await prisma.lab.deleteMany({ where: { id: { in: [testLab.id, ...createdLabIds] } } });
    await prisma.user.deleteMany({ where: { id: { in: [adminUser.id, labManager.id, member.id] } } });
    await prisma.$disconnect();
  });

  describe('GET /api/admin/get-labs', () => {
    it('should allow admin access, reject others', async () => {
      const adminResponse = await adminAgent.get('/api/admin/get-labs').expect(200);
      expect(Array.isArray(adminResponse.body)).toBe(true);
      
      const lab = adminResponse.body.find((l: any) => l.id === testLab.id);
      expect(lab).toBeDefined();
      expect(lab).toHaveProperty('name');
      expect(lab).toHaveProperty('location');
      expect(lab).toHaveProperty('status');

      // Others cannot access
      await Promise.all([
        managerAgent.get('/api/admin/get-labs').expect(403),
        memberAgent.get('/api/admin/get-labs').expect(403)
      ]);
    });
  });

  describe('GET /api/admin/get-lab/:id', () => {
    it('should allow admin to get lab by id', async () => {
      const adminResponse = await adminAgent.get(`/api/admin/get-lab/${testLab.id}`).expect(200);
      expect(adminResponse.body).toHaveProperty('id', testLab.id);
      expect(adminResponse.body).toHaveProperty('name');
      expect(adminResponse.body).toHaveProperty('location');
      expect(adminResponse.body).toHaveProperty('status');
    });

    it('should return 404 for non-existent lab', async () => {
      await adminAgent.get('/api/admin/get-lab/99999').expect(404);
    });

    it('should return 400 for invalid lab ID', async () => {
      await adminAgent.get('/api/admin/get-lab/invalid').expect(400);
    });
  });

  describe('POST /api/admin/create-lab', () => {
    afterEach(async () => {
      // Clean up created labs (proper order to avoid foreign key constraints)
      const createdLabs = await prisma.lab.findMany({
        where: { name: { contains: 'Test Lab Create' } }
      });
      const labIds = createdLabs.map(lab => lab.id);
      
      // Delete in correct order: discussions first, then lab members, then labs
      await prisma.discussion.deleteMany({ where: { labId: { in: labIds } } });
      await prisma.labMember.deleteMany({ where: { labId: { in: labIds } } });
      await prisma.lab.deleteMany({ where: { id: { in: labIds } } });
      createdLabIds.push(...labIds);
    });

    it('should allow admin to create lab, reject others', async () => {
      const labData = {
        name: `Test Lab Create ${Date.now()}`,
        location: 'New Lab Location',
        status: 'active'
      };

      // Admin can create
      const adminResponse = await adminAgent
        .post('/api/admin/create-lab')
        .send(labData)
        .expect(201);
      
      expect(adminResponse.body).toHaveProperty('id');
      expect(adminResponse.body.name).toBe(labData.name);
      expect(adminResponse.body.location).toBe(labData.location);

      // Others cannot create
      await Promise.all([
        managerAgent.post('/api/admin/create-lab').send(labData).expect(403),
        memberAgent.post('/api/admin/create-lab').send(labData).expect(403)
      ]);
    });

    it('should validate required fields', async () => {
      await adminAgent
        .post('/api/admin/create-lab')
        .send({ location: 'Missing name' })
        .expect(500); // Controller returns 500 for missing required fields
    });
  });

  describe('PUT /api/admin/lab/:id', () => {
    let updateTestLab: any;

    beforeEach(async () => {
      updateTestLab = await prisma.lab.create({
        data: {
          name: `Update Test Lab ${Date.now()}`,
          location: 'Original Location',
          status: 'active'
        }
      });
      createdLabIds.push(updateTestLab.id);
    });

    it('should allow admin to update lab, reject others', async () => {
      const updateData = {
        name: 'Updated Lab Name',
        location: 'Updated Location',
        status: 'inactive'
      };

      // Admin can update
      const adminResponse = await adminAgent
        .put(`/api/admin/lab/${updateTestLab.id}`)
        .send(updateData)
        .expect(200);
      
      expect(adminResponse.body.name).toBe(updateData.name);
      expect(adminResponse.body.location).toBe(updateData.location);
      expect(adminResponse.body.status).toBe(updateData.status);

      // Others cannot update
      await Promise.all([
        managerAgent.put(`/api/admin/lab/${updateTestLab.id}`).send(updateData).expect(403),
        memberAgent.put(`/api/admin/lab/${updateTestLab.id}`).send(updateData).expect(403)
      ]);
    });

    it('should return 404 for non-existent lab', async () => {
      await adminAgent
        .put('/api/admin/lab/99999')
        .send({ name: 'Non-existent' })
        .expect(404);
    });
  });

  describe('DELETE /api/admin/lab/:id', () => {
    let deleteTestLab: any;

    beforeEach(async () => {
      deleteTestLab = await prisma.lab.create({
        data: {
          name: `Delete Test Lab ${Date.now()}`,
          location: 'Will be deleted',
          status: 'active'
        }
      });
    });

    it('should allow admin to delete lab, reject others', async () => {
      // Others cannot delete
      await Promise.all([
        managerAgent.delete(`/api/admin/lab/${deleteTestLab.id}`).expect(403),
        memberAgent.delete(`/api/admin/lab/${deleteTestLab.id}`).expect(403)
      ]);

      // Admin can delete
      await adminAgent.delete(`/api/admin/lab/${deleteTestLab.id}`).expect(200);

      // Verify deletion
      const deleted = await prisma.lab.findUnique({ where: { id: deleteTestLab.id } });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent lab', async () => {
      await adminAgent.delete('/api/admin/lab/99999').expect(404);
    });
  });

  describe('Lab CRUD Integration', () => {
    it('should support complete lab lifecycle', async () => {
      // Create
      const createData = {
        name: `Lifecycle Lab ${Date.now()}`,
        location: 'Lifecycle Location',
        status: 'active'
      };
      
      const createResponse = await adminAgent
        .post('/api/admin/create-lab')
        .send(createData)
        .expect(201);
      const labId = createResponse.body.id;

      // Update
      const updateData = {
        name: 'Updated Lifecycle Lab',
        location: 'Updated Location',
        status: 'inactive'
      };
      
      const updateResponse = await adminAgent
        .put(`/api/admin/lab/${labId}`)
        .send(updateData)
        .expect(200);
      expect(updateResponse.body.name).toBe(updateData.name);

      // Verify in list
      const getAllResponse = await adminAgent.get('/api/admin/get-labs').expect(200);
      const foundLab = getAllResponse.body.find((lab: any) => lab.id === labId);
      expect(foundLab).toBeDefined();
      expect(foundLab.name).toBe(updateData.name);

      // Delete
      await adminAgent.delete(`/api/admin/lab/${labId}`).expect(200);

      // Verify deletion
      const deleted = await prisma.lab.findUnique({ where: { id: labId } });
      expect(deleted).toBeNull();
    });
  });
});