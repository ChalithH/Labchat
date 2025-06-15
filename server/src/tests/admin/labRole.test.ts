import request from 'supertest';
import app from '../../app';
import { prisma } from '../..';
import bcrypt from 'bcryptjs';

describe('Admin Lab Role Management Tests', () => {
  let adminUser: any, labManager: any, member: any;
  let lab: any;
  let adminAgent: ReturnType<typeof request.agent>;
  let managerAgent: ReturnType<typeof request.agent>;
  let memberAgent: ReturnType<typeof request.agent>;
  let createdRoleIds: number[] = [];

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
        universityId: 'U30001',
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
        universityId: 'U30002',
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
        universityId: 'U30003',
        username: `member_${timestamp}`,
        loginEmail: `member_${timestamp}@test.com`,
        loginPassword: hashedPassword,
        firstName: 'Regular',
        lastName: 'Member',
        displayName: 'Regular Member'
      }
    });

    // Create test lab
    lab = await prisma.lab.create({
      data: {
        name: `Test Lab ${timestamp}`,
        location: 'Test Location',
        status: 'active'
      }
    });

    // Create lab memberships
    await prisma.labMember.create({
      data: {
        userId: labManager.id,
        labId: lab.id,
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
    await prisma.labMember.deleteMany({ where: { labId: lab.id } });
    await prisma.lab.deleteMany({ where: { id: lab.id } });
    await prisma.labRole.deleteMany({ where: { id: { in: createdRoleIds } } });
    await prisma.user.deleteMany({ where: { id: { in: [adminUser.id, labManager.id, member.id] } } });
    await prisma.$disconnect();
  });

  describe('GET /api/admin/get-lab-roles', () => {
    it('should allow anyone authenticated to access', async () => {
      const adminResponse = await adminAgent.get('/api/admin/get-lab-roles').expect(200);
      expect(Array.isArray(adminResponse.body)).toBe(true);
      
      if (adminResponse.body.length > 0) {
        const role = adminResponse.body[0];
        expect(role).toHaveProperty('id');
        expect(role).toHaveProperty('name');
        expect(role).toHaveProperty('permissionLevel');
      }

      // Others can also access (permission level 0 required)
      await Promise.all([
        managerAgent.get('/api/admin/get-lab-roles').expect(200),
        memberAgent.get('/api/admin/get-lab-roles').expect(200)
      ]);
    });
  });

  describe('POST /api/admin/create-lab-role', () => {
    afterEach(async () => {
      // Clean up created roles
      const createdRoles = await prisma.labRole.findMany({
        where: { name: { contains: 'Test Role' } }
      });
      const roleIds = createdRoles.map(role => role.id);
      await prisma.labRole.deleteMany({ where: { id: { in: roleIds } } });
      createdRoleIds.push(...roleIds);
    });

    it('should allow admin and lab manager to create roles, reject regular members', async () => {
      const roleData = {
        name: `Test Role ${Date.now()}`,
        permissionLevel: 50
      };

      // Admin can create
      const adminResponse = await adminAgent
        .post('/api/admin/create-lab-role')
        .send(roleData)
        .expect(201);
      
      expect(adminResponse.body).toHaveProperty('id');
      expect(adminResponse.body.name).toBe(roleData.name);
      expect(adminResponse.body.permissionLevel).toBe(roleData.permissionLevel);

      // Lab manager can also create (according to controller logic)
      await managerAgent.post('/api/admin/create-lab-role').send({
        name: `Manager Test Role ${Date.now()}`,
        permissionLevel: 50
      }).expect(201);
      
      // Regular member cannot create
      await memberAgent.post('/api/admin/create-lab-role').send({
        name: `Member Test Role ${Date.now()}`,
        permissionLevel: 50
      }).expect(403);
    });

    it('should validate required fields', async () => {
      await adminAgent
        .post('/api/admin/create-lab-role')
        .send({ permissionLevel: 30 })
        .expect(400);
    });

    it('should validate permission level range', async () => {
      await adminAgent
        .post('/api/admin/create-lab-role')
        .send({ name: 'Invalid Role', permissionLevel: 150 })
        .expect(400);
    });
  });

  // UPDATE endpoint not implemented - skipping tests

  // DELETE endpoint not implemented - skipping tests

  describe('Lab Role Integration', () => {
    it('should support create and read operations', async () => {
      // Create
      const createData = {
        name: `Integration Role ${Date.now()}`,
        permissionLevel: 45
      };
      
      const createResponse = await adminAgent
        .post('/api/admin/create-lab-role')
        .send(createData)
        .expect(201);
      const roleId = createResponse.body.id;

      // Verify in list
      const getAllResponse = await adminAgent.get('/api/admin/get-lab-roles').expect(200);
      const foundRole = getAllResponse.body.find((role: any) => role.id === roleId);
      expect(foundRole).toBeDefined();
      expect(foundRole.name).toBe(createData.name);

      // Manual cleanup (since DELETE endpoint not implemented)
      await prisma.labRole.delete({ where: { id: roleId } });
    });
  });
});