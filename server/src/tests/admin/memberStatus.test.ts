import request from 'supertest';
import app from '../../app';
import { prisma } from '../..';
import bcrypt from 'bcryptjs';

describe('Member Status Admin Tests', () => {
  let adminUser: any;
  let labManager: any;
  let regularMember: any;
  let labA: any;
  let managerRole: any;
  let studentRole: any;
  let testStatus: any;
  let testContact: any;
  let testLabMember: any;

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

    // Get or create test status
    testStatus = await prisma.status.findFirst({ where: { statusName: 'Online' } }) ||
                 await prisma.status.create({
                   data: { statusName: 'Online', statusWeight: 1 }
                 });

    // Create test users
    adminUser = await prisma.user.create({
      data: {
        roleId: adminRole.id,
        universityId: 'U40001',
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
        universityId: 'U40002',
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
        universityId: 'U40003',
        username: `member_${timestamp}`,
        loginEmail: `member_${timestamp}@test.com`,
        loginPassword: hashedPassword,
        firstName: 'Regular',
        lastName: 'Member',
        displayName: 'Regular Member'
      }
    });

    // Create test contact for regular member
    testContact = await prisma.contact.create({
      data: {
        userId: regularMember.id,
        type: 'email',
        info: regularMember.loginEmail,
        name: 'Primary Email'
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

    testLabMember = await prisma.labMember.create({
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
    await prisma.memberStatus.deleteMany({
      where: {
        memberId: testLabMember.id
      }
    });

    await prisma.labMember.deleteMany({
      where: { labId: labA.id }
    });

    await prisma.contact.deleteMany({
      where: { userId: { in: [adminUser.id, labManager.id, regularMember.id] } }
    });

    await prisma.lab.deleteMany({
      where: { id: labA.id }
    });

    await prisma.user.deleteMany({
      where: { id: { in: [adminUser.id, labManager.id, regularMember.id] } }
    });

    await prisma.$disconnect();
  });

  describe('POST /api/admin/lab-member/:labMemberId/status', () => {
    afterEach(async () => {
      await prisma.memberStatus.deleteMany({
        where: { memberId: testLabMember.id }
      });
    });

    it('should allow admin to create member status', async () => {
      const statusData = {
        statusId: testStatus.id,
        contactId: testContact.id,
        description: 'Test status description'
      };

      const response = await adminAgent
        .post(`/api/admin/lab-member/${testLabMember.id}/status`)
        .send(statusData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.statusId).toBe(testStatus.id);
    });

    it('should allow lab manager to create member status', async () => {
      const statusData = {
        statusId: testStatus.id,
        contactId: testContact.id,
        description: 'Lab manager can create status'
      };

      const response = await managerAgent
        .post(`/api/admin/lab-member/${testLabMember.id}/status`)
        .send(statusData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should reject regular member', async () => {
      const statusData = {
        statusId: testStatus.id,
        contactId: testContact.id,
        description: 'Should not work'
      };

      await memberAgent
        .post(`/api/admin/lab-member/${testLabMember.id}/status`)
        .send(statusData)
        .expect(403);
    });

    it('should validate required fields', async () => {
      await adminAgent
        .post(`/api/admin/lab-member/${testLabMember.id}/status`)
        .send({ description: 'Missing statusId' })
        .expect(400);
    });
  });

  describe('GET /api/member/statuses', () => {
    it('should allow admin to get all statuses', async () => {
      const response = await adminAgent
        .get('/api/member/statuses')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should allow lab manager to get all statuses', async () => {
      const response = await managerAgent
        .get('/api/member/statuses')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should allow regular member to get all statuses', async () => {
      const response = await memberAgent
        .get('/api/member/statuses')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/member/set-status', () => {
    beforeEach(async () => {
      // Create a member status first
      await prisma.memberStatus.create({
        data: {
          memberId: testLabMember.id,
          statusId: testStatus.id,
          contactId: testContact.id,
          description: 'Test status',
          isActive: false
        }
      });
    });

    afterEach(async () => {
      await prisma.memberStatus.deleteMany({
        where: { memberId: testLabMember.id }
      });
    });

    it('should allow member to set their own status', async () => {
      const statusData = {
        memberId: testLabMember.id,
        statusId: testStatus.id
      };

      const response = await memberAgent
        .post('/api/member/set-status')
        .send(statusData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should allow lab manager to set member status', async () => {
      const statusData = {
        memberId: testLabMember.id,
        statusId: testStatus.id
      };

      const response = await managerAgent
        .post('/api/member/set-status')
        .send(statusData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should allow admin to set member status', async () => {
      const statusData = {
        memberId: testLabMember.id,
        statusId: testStatus.id
      };

      const response = await adminAgent
        .post('/api/member/set-status')
        .send(statusData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /api/admin/member-status/:memberStatusId', () => {
    let testMemberStatusId: number;

    beforeEach(async () => {
      const memberStatus = await prisma.memberStatus.create({
        data: {
          memberId: testLabMember.id,
          statusId: testStatus.id,
          contactId: testContact.id,
          description: 'Test status to delete',
          isActive: false
        }
      });
      testMemberStatusId = memberStatus.id;
    });

    it('should allow admin to delete member status', async () => {
      await adminAgent
        .delete(`/api/admin/member-status/${testMemberStatusId}`)
        .expect(200);

      const deletedStatus = await prisma.memberStatus.findUnique({
        where: { id: testMemberStatusId }
      });
      expect(deletedStatus).toBeNull();
    });

    it('should allow lab manager to delete member status', async () => {
      await managerAgent
        .delete(`/api/admin/member-status/${testMemberStatusId}`)
        .expect(200);
    });

    it('should reject regular member from deleting', async () => {
      await memberAgent
        .delete(`/api/admin/member-status/${testMemberStatusId}`)
        .expect(403);
    });
  });
});