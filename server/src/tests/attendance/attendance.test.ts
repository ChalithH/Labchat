import request from 'supertest';
import app from '../../app';
import { prisma } from '../..';
import bcrypt from 'bcryptjs';

describe('Attendance Tests', () => {
  let adminUser: any, labManager: any, member: any, nonMember: any;
  let testLab: any;
  let adminAgent: any, managerAgent: any, memberAgent: any, nonMemberAgent: any;

  beforeAll(async () => {
    const timestamp = Date.now();
    const password = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get roles
    const adminRole = await prisma.role.findFirst({ where: { permissionLevel: 100 } });
    const memberRole = await prisma.role.findFirst({ where: { permissionLevel: { lt: 100 } } });
    const managerRole = await prisma.labRole.findFirst({ where: { permissionLevel: { gte: 70 } } });
    const studentRole = await prisma.labRole.findFirst({ where: { permissionLevel: { lte: 30 } } });

    if (!adminRole || !memberRole || !managerRole || !studentRole) {
      throw new Error('Required roles not found');
    }

    // Create test lab
    testLab = await prisma.lab.create({
      data: {
        name: `Test Lab ${timestamp}`,
        location: 'Test Location',
        status: 'active'
      }
    });

    // Create users
    adminUser = await prisma.user.create({
      data: {
        roleId: adminRole.id,
        universityId: 'U10001',
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
        universityId: 'U10002',
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
        universityId: 'U10003',
        username: `member_${timestamp}`,
        loginEmail: `member_${timestamp}@test.com`,
        loginPassword: hashedPassword,
        firstName: 'Regular',
        lastName: 'Member',
        displayName: 'Regular Member'
      }
    });

    nonMember = await prisma.user.create({
      data: {
        roleId: memberRole.id,
        universityId: 'U10004',
        username: `nonmember_${timestamp}`,
        loginEmail: `nonmember_${timestamp}@test.com`,
        loginPassword: hashedPassword,
        firstName: 'Non',
        lastName: 'Member',
        displayName: 'Non Member'
      }
    });

    // Create lab memberships
    await prisma.labMember.create({
      data: {
        userId: labManager.id,
        labId: testLab.id,
        labRoleId: managerRole.id
      }
    });

    await prisma.labMember.create({
      data: {
        userId: member.id,
        labId: testLab.id,
        labRoleId: studentRole.id
      }
    });

    // Setup agents
    adminAgent = request.agent(app);
    managerAgent = request.agent(app);
    memberAgent = request.agent(app);
    nonMemberAgent = request.agent(app);

    await Promise.all([
      adminAgent.post('/api/auth/login').send({ loginEmail: adminUser.loginEmail, loginPassword: password }),
      managerAgent.post('/api/auth/login').send({ loginEmail: labManager.loginEmail, loginPassword: password }),
      memberAgent.post('/api/auth/login').send({ loginEmail: member.loginEmail, loginPassword: password }),
      nonMemberAgent.post('/api/auth/login').send({ loginEmail: nonMember.loginEmail, loginPassword: password })
    ]);
  });

  afterAll(async () => {
    await prisma.labAttendance.deleteMany({ where: { member: { labId: testLab.id } } });
    await prisma.labMember.deleteMany({ where: { labId: testLab.id } });
    await prisma.lab.delete({ where: { id: testLab.id } });
    await prisma.user.deleteMany({ 
      where: { id: { in: [adminUser.id, labManager.id, member.id, nonMember.id] } }
    });
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.labAttendance.deleteMany({ where: { member: { labId: testLab.id } } });
  });

  describe('POST /api/attendance/clock-in', () => {
    it('should allow lab member to clock in', async () => {
      const response = await memberAgent
        .post('/api/attendance/clock-in')
        .send({ labId: testLab.id })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Clocked in successfully.');
      expect(response.body.attendance).toHaveProperty('clockIn');
      expect(response.body.attendance.clockOut).toBeNull();
    });

    it('should prevent double clock-in', async () => {
      await memberAgent.post('/api/attendance/clock-in').send({ labId: testLab.id });
      
      await memberAgent
        .post('/api/attendance/clock-in')
        .send({ labId: testLab.id })
        .expect(400);
    });

    it('should reject non-lab member', async () => {
      await nonMemberAgent
        .post('/api/attendance/clock-in')
        .send({ labId: testLab.id })
        .expect(403);
    });

    it('should reject unauthenticated user', async () => {
      await request(app)
        .post('/api/attendance/clock-in')
        .send({ labId: testLab.id })
        .expect(401);
    });
  });

  describe('POST /api/attendance/clock-out', () => {
    beforeEach(async () => {
      await memberAgent.post('/api/attendance/clock-in').send({ labId: testLab.id });
    });

    it('should allow clocked in user to clock out', async () => {
      const response = await memberAgent
        .post('/api/attendance/clock-out')
        .send({ labId: testLab.id })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Clocked out successfully.');
      expect(response.body.attendance).toHaveProperty('clockOut');
    });

    it('should prevent clock-out when not clocked in', async () => {
      await memberAgent.post('/api/attendance/clock-out').send({ labId: testLab.id });
      
      await memberAgent
        .post('/api/attendance/clock-out')
        .send({ labId: testLab.id })
        .expect(400);
    });

    it('should reject non-lab member', async () => {
      await nonMemberAgent
        .post('/api/attendance/clock-out')
        .send({ labId: testLab.id })
        .expect(403);
    });
  });

  describe('GET /api/attendance/status', () => {
    it('should return clocked in status', async () => {
      await memberAgent.post('/api/attendance/clock-in').send({ labId: testLab.id });

      const response = await memberAgent
        .get('/api/attendance/status')
        .query({ labId: testLab.id })
        .expect(200);

      expect(response.body.isClockedIn).toBe(true);
      expect(response.body).toHaveProperty('clockInTime');
    });

    it('should return clocked out status', async () => {
      const response = await memberAgent
        .get('/api/attendance/status')
        .query({ labId: testLab.id })
        .expect(200);

      expect(response.body.isClockedIn).toBe(false);
    });

    it('should reject non-lab member', async () => {
      await nonMemberAgent
        .get('/api/attendance/status')
        .query({ labId: testLab.id })
        .expect(403);
    });
  });

  describe('GET /api/attendance/current-members', () => {
    it('should return list of clocked in members', async () => {
      await Promise.all([
        memberAgent.post('/api/attendance/clock-in').send({ labId: testLab.id }),
        managerAgent.post('/api/attendance/clock-in').send({ labId: testLab.id })
      ]);

      const response = await memberAgent
        .get('/api/attendance/current-members')
        .query({ labId: testLab.id })
        .expect(200);

      expect(response.body.members).toHaveLength(2);
      expect(response.body.members[0]).toHaveProperty('name');
      expect(response.body.members[0]).toHaveProperty('role');
    });

    it('should return empty list when no one clocked in', async () => {
      const response = await memberAgent
        .get('/api/attendance/current-members')
        .query({ labId: testLab.id })
        .expect(200);

      expect(response.body.members).toHaveLength(0);
    });

    it('should work for unauthenticated users', async () => {
      const response = await request(app)
        .get('/api/attendance/current-members')
        .query({ labId: testLab.id })
        .expect(200);

      expect(response.body).toHaveProperty('members');
    });
  });

  describe('GET /api/attendance/logs/:labId', () => {
    beforeEach(async () => {
      await memberAgent.post('/api/attendance/clock-in').send({ labId: testLab.id });
      await memberAgent.post('/api/attendance/clock-out').send({ labId: testLab.id });
    });

    it('should allow admin to view logs', async () => {
      const response = await adminAgent
        .get(`/api/attendance/logs/${testLab.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.logs.length).toBeGreaterThan(0);
    });

    it('should allow lab manager to view logs', async () => {
      const response = await managerAgent
        .get(`/api/attendance/logs/${testLab.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
    });

    it('should reject regular member', async () => {
      await memberAgent
        .get(`/api/attendance/logs/${testLab.id}`)
        .expect(403);
    });

    it('should support pagination', async () => {
      const response = await adminAgent
        .get(`/api/attendance/logs/${testLab.id}`)
        .query({ page: 1, limit: 1 })
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });
  });

  describe('Attendance Flow', () => {
    it('should complete full clock in/out cycle', async () => {
      // Start clocked out
      let status = await memberAgent.get('/api/attendance/status').query({ labId: testLab.id });
      expect(status.body.isClockedIn).toBe(false);

      // Clock in
      await memberAgent.post('/api/attendance/clock-in').send({ labId: testLab.id });
      status = await memberAgent.get('/api/attendance/status').query({ labId: testLab.id });
      expect(status.body.isClockedIn).toBe(true);

      // Should appear in current members
      let members = await memberAgent.get('/api/attendance/current-members').query({ labId: testLab.id });
      expect(members.body.members).toHaveLength(1);

      // Clock out
      await memberAgent.post('/api/attendance/clock-out').send({ labId: testLab.id });
      status = await memberAgent.get('/api/attendance/status').query({ labId: testLab.id });
      expect(status.body.isClockedIn).toBe(false);

      // Should not appear in current members
      members = await memberAgent.get('/api/attendance/current-members').query({ labId: testLab.id });
      expect(members.body.members).toHaveLength(0);
    });
  });
});