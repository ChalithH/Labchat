import request from 'supertest';
import app from '../../app';
import { prisma } from '../..';
import bcrypt from 'bcryptjs';

describe('Instrument Admin Tests', () => {
  let adminUser: any;
  let labManager: any;
  let regularMember: any;
  let labA: any;
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
        universityId: 'U60001',
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
        universityId: 'U60002',
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
        universityId: 'U60003',
        username: `member_${timestamp}`,
        loginEmail: `member_${timestamp}@test.com`,
        loginPassword: hashedPassword,
        firstName: 'Regular',
        lastName: 'Member',
        displayName: 'Regular Member'
      }
    });

    // Create test lab
    labA = await prisma.lab.create({
      data: {
        name: `Test Lab A ${timestamp}`,
        location: 'Location A',
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
    await prisma.event.deleteMany({
      where: {
        labId: labA.id
      }
    });

    await prisma.instrument.deleteMany({
      where: { id: { gt: 0 } }
    });

    await prisma.labMember.deleteMany({
      where: { labId: labA.id }
    });

    await prisma.lab.deleteMany({
      where: { id: labA.id }
    });

    await prisma.user.deleteMany({
      where: { id: { in: [adminUser.id, labManager.id, regularMember.id] } }
    });

    await prisma.$disconnect();
  });

  describe('POST /api/admin/create-instrument', () => {
    it('should allow admin to create instrument', async () => {
      const instrumentData = {
        name: 'Test Instrument',
        description: 'Test instrument description'
      };

      const response = await adminAgent
        .post('/api/admin/create-instrument')
        .send(instrumentData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(instrumentData.name);
    });

    it('should reject lab manager', async () => {
      const instrumentData = {
        name: 'Should Not Work',
        description: 'This should be rejected'
      };

      await managerAgent
        .post('/api/admin/create-instrument')
        .send(instrumentData)
        .expect(403);
    });

    it('should reject regular member', async () => {
      const instrumentData = {
        name: 'Should Not Work',
        description: 'This should be rejected'
      };

      await memberAgent
        .post('/api/admin/create-instrument')
        .send(instrumentData)
        .expect(403);
    });

    it('should validate required fields', async () => {
      await adminAgent
        .post('/api/admin/create-instrument')
        .send({ description: 'Missing name' })
        .expect(400);
    });
  });

  describe('GET /api/admin/get-all-instruments', () => {
    beforeEach(async () => {
      // Create a test instrument
      await prisma.instrument.create({
        data: {
          name: 'Test Instrument for Get',
          description: 'For testing get endpoint'
        }
      });
    });

    afterEach(async () => {
      await prisma.instrument.deleteMany({
        where: { name: 'Test Instrument for Get' }
      });
    });

    it('should allow admin to get all instruments', async () => {
      const response = await adminAgent
        .get('/api/admin/get-all-instruments')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should reject lab manager', async () => {
      await managerAgent
        .get('/api/admin/get-all-instruments')
        .expect(403);
    });

    it('should reject regular member', async () => {
      await memberAgent
        .get('/api/admin/get-all-instruments')
        .expect(403);
    });
  });
});