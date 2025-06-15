import request from 'supertest';
import app from '../../app';
import { prisma } from '../..';
import bcrypt from 'bcryptjs';

describe('Lab Member Admin Tests', () => {
  let adminUser: any;
  let labManagerA: any;
  let regularMember: any;
  let availableUser: any;
  let labA: any;
  let labB: any;
  let studentRole: any;
  let staffRole: any;
  let managerRole: any;

  let adminAgent: any;
  let managerAgent: any;
  let memberAgent: any;

  beforeAll(async () => {
    const timestamp = Date.now();
    const password = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get existing roles from seed data
    const adminRole = await prisma.role.findFirst({ where: { permissionLevel: 100 } });
    const memberRole = await prisma.role.findFirst({ where: { permissionLevel: { lt: 100 } } });
    
    managerRole = await prisma.labRole.findFirst({ where: { permissionLevel: { gte: 70 } } });
    staffRole = await prisma.labRole.findFirst({ where: { permissionLevel: { gte: 30, lt: 70 } } });
    studentRole = await prisma.labRole.findFirst({ 
      where: { permissionLevel: { lte: 30, gte: 0 } },
      orderBy: { permissionLevel: 'asc' }
    });

    if (!adminRole || !memberRole || !managerRole || !staffRole || !studentRole) {
      throw new Error('Required roles not found');
    }

    // Create test users
    adminUser = await prisma.user.create({
      data: {
        roleId: adminRole.id,
        universityId: 'U12345001',
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
        universityId: 'U12345002',
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
        universityId: 'U12345003',
        username: `member_${timestamp}`,
        loginEmail: `member_${timestamp}@test.com`,
        loginPassword: hashedPassword,
        firstName: 'Regular',
        lastName: 'Member',
        displayName: 'Regular Member'
      }
    });

    availableUser = await prisma.user.create({
      data: {
        roleId: memberRole.id,
        universityId: 'U12345004',
        username: `available_${timestamp}`,
        loginEmail: `available_${timestamp}@test.com`,
        loginPassword: hashedPassword,
        firstName: 'Available',
        lastName: 'User',
        displayName: 'Available User'
      }
    });

    // Create contact for available user
    await prisma.contact.create({
      data: {
        userId: availableUser.id,
        type: 'email',
        info: availableUser.loginEmail,
        name: 'Primary Email'
      }
    });

    // Ensure required status records exist
    await prisma.status.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, statusName: 'Online', statusWeight: 1 }
    });

    await prisma.status.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, statusName: 'Offline', statusWeight: 3 }
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
    // Clean up test data
    await prisma.memberStatus.deleteMany({
      where: {
        labMember: {
          labId: { in: [labA.id, labB.id] }
        }
      }
    });

    await prisma.labAdmission.deleteMany({
      where: { labId: { in: [labA.id, labB.id] } }
    });

    await prisma.labMember.deleteMany({
      where: { labId: { in: [labA.id, labB.id] } }
    });

    await prisma.lab.deleteMany({
      where: { id: { in: [labA.id, labB.id] } }
    });

    await prisma.contact.deleteMany({
      where: {
        userId: { in: [adminUser.id, labManagerA.id, regularMember.id, availableUser.id] }
      }
    });

    await prisma.user.deleteMany({
      where: { id: { in: [adminUser.id, labManagerA.id, regularMember.id, availableUser.id] } }
    });

    await prisma.$disconnect();
  });

  describe('GET /api/admin/lab/:labId/available-users', () => {
    it('should allow lab manager to get available users', async () => {
      const response = await managerAgent
        .get(`/api/admin/lab/${labA.id}/available-users`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('should allow admin to get available users', async () => {
      const response = await adminAgent
        .get(`/api/admin/lab/${labA.id}/available-users`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
    });

    it('should reject regular member', async () => {
      await memberAgent
        .get(`/api/admin/lab/${labA.id}/available-users`)
        .expect(403);
    });
  });

  describe('POST /api/admin/lab/:labId/add-user', () => {
    it('should allow lab manager to add user', async () => {
      const userData = {
        userId: availableUser.id,
        labRoleId: studentRole.id
      };

      const response = await managerAgent
        .post(`/api/admin/lab/${labA.id}/add-user`)
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('labMember');
    });

    it('should prevent duplicate member addition', async () => {
      const userData = {
        userId: regularMember.id,
        labRoleId: staffRole.id
      };

      await managerAgent
        .post(`/api/admin/lab/${labA.id}/add-user`)
        .send(userData)
        .expect(409);
    });
  });

  describe('DELETE /api/admin/remove-user', () => {
    beforeEach(async () => {
      // Clean any existing member first
      await prisma.labMember.deleteMany({
        where: { userId: availableUser.id, labId: labA.id }
      });
      
      // Add user to remove
      await prisma.labMember.create({
        data: {
          userId: availableUser.id,
          labId: labA.id,
          labRoleId: studentRole.id
        }
      });
    });

    it('should allow lab manager to remove user (soft delete)', async () => {
      const response = await managerAgent
        .delete('/api/admin/remove-user')
        .send({ 
          labId: labA.id,
          userId: availableUser.id 
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User removed from lab');
    });
  });

  describe('PUT /api/admin/lab-member/:labMemberId/role', () => {
    let memberId: number;

    beforeEach(async () => {
      // Clean and create test member
      await prisma.labMember.deleteMany({
        where: { userId: availableUser.id, labId: labA.id }
      });
      
      const member = await prisma.labMember.create({
        data: {
          userId: availableUser.id,
          labId: labA.id,
          labRoleId: studentRole.id
        }
      });
      memberId = member.id;
    });

    it('should allow lab manager to update member role', async () => {
      const response = await managerAgent
        .put(`/api/admin/lab-member/${memberId}/role`)
        .send({ newLabRoleId: staffRole.id })
        .expect(200);

      expect(response.body).toHaveProperty('labRoleId', staffRole.id);
    });

    it('should reject regular member', async () => {
      await memberAgent
        .put(`/api/admin/lab-member/${memberId}/role`)
        .send({ newLabRoleId: staffRole.id })
        .expect(403);
    });
  });

  describe('PUT /api/admin/lab-member/:labMemberId/induction', () => {
    let memberId: number;

    beforeEach(async () => {
      await prisma.labMember.deleteMany({
        where: { userId: availableUser.id, labId: labA.id }
      });
      
      const member = await prisma.labMember.create({
        data: {
          userId: availableUser.id,
          labId: labA.id,
          labRoleId: studentRole.id,
          inductionDone: false
        }
      });
      memberId = member.id;
    });

    it('should allow lab manager to toggle induction status', async () => {
      const response = await managerAgent
        .put(`/api/admin/lab-member/${memberId}/induction`)
        .expect(200);

      expect(response.body).toHaveProperty('inductionDone', true);
    });
  });

  describe('PUT /api/admin/lab-member/:labMemberId/pci', () => {
    let memberId: number;

    beforeEach(async () => {
      await prisma.labMember.deleteMany({
        where: { userId: availableUser.id, labId: labA.id }
      });
      
      const member = await prisma.labMember.create({
        data: {
          userId: availableUser.id,
          labId: labA.id,
          labRoleId: studentRole.id,
          isPCI: false
        }
      });
      memberId = member.id;
    });

    it('should allow lab manager to set PCI status', async () => {
      const response = await managerAgent
        .put(`/api/admin/lab-member/${memberId}/pci`)
        .send({ isPCI: true })
        .expect(200);

      expect(response.body).toHaveProperty('isPCI', true);
    });
  });

  describe('PUT /api/admin/lab/:labId/reset-member-password', () => {
    it('should allow lab manager to reset member password', async () => {
      const resetData = {
        userId: regularMember.id,
        newPassword: 'NewPassword123!'
      };

      const response = await managerAgent
        .put(`/api/admin/lab/${labA.id}/reset-member-password`)
        .send(resetData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Password reset successfully');
    });

    it('should reject regular member', async () => {
      const resetData = {
        userId: regularMember.id,
        newPassword: 'NewPassword123!'
      };

      await memberAgent
        .put(`/api/admin/lab/${labA.id}/reset-member-password`)
        .send(resetData)
        .expect(403);
    });
  });
});