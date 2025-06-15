import request from 'supertest';
import app from '../../app';
import { prisma } from '../..';
import bcrypt from 'bcryptjs';

describe('Discussion Admin Tests', () => {
  let adminUser: any, labManager: any, member: any;
  let lab: any, studentRole: any;
  let adminAgent: ReturnType<typeof request.agent>;
  let managerAgent: ReturnType<typeof request.agent>;
  let memberAgent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const timestamp = Date.now();
    const password = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get roles
    const adminRole = await prisma.role.findFirst({ where: { permissionLevel: 100 } });
    const memberRole = await prisma.role.findFirst({ where: { permissionLevel: { lt: 100 } } });
    const managerRole = await prisma.labRole.findFirst({ where: { permissionLevel: { gte: 70 } } });
    studentRole = await prisma.labRole.findFirst({ 
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
    await prisma.discussionReply.deleteMany({ where: { post: { discussion: { labId: lab.id } } } });
    await prisma.discussionPost.deleteMany({ where: { discussion: { labId: lab.id } } });
    await prisma.discussion.deleteMany({ where: { labId: lab.id } });
    await prisma.labMember.deleteMany({ where: { labId: lab.id } });
    await prisma.lab.deleteMany({ where: { id: lab.id } });
    await prisma.user.deleteMany({ where: { id: { in: [adminUser.id, labManager.id, member.id] } } });
    await prisma.$disconnect();
  });

  describe('POST /api/admin/create-discussion-category', () => {
    afterEach(async () => {
      await prisma.discussion.deleteMany({ where: { labId: lab.id } });
    });

    it('should allow admin/manager to create category, reject member', async () => {
      const categoryData = { labId: lab.id, name: 'Test Category', description: 'Test category' };

      // Admin can create
      const adminResponse = await adminAgent
        .post('/api/admin/create-discussion-category')
        .send(categoryData)
        .expect(201);
      expect(adminResponse.body).toHaveProperty('id');

      // Manager can create
      await managerAgent
        .post('/api/admin/create-discussion-category')
        .send({ ...categoryData, name: 'Manager Category' })
        .expect(201);

      // Member cannot create
      await memberAgent
        .post('/api/admin/create-discussion-category')
        .send(categoryData)
        .expect(403);
    });

    it('should validate required fields', async () => {
      await adminAgent
        .post('/api/admin/create-discussion-category')
        .send({ description: 'Missing name and labId' })
        .expect(400);
    });
  });

  describe('PUT /api/admin/lab/:labId/update-discussion/:discussionId', () => {
    let categoryId: number;

    beforeEach(async () => {
      const category = await prisma.discussion.create({
        data: { labId: lab.id, name: 'Update Test Category', description: 'Will be updated' }
      });
      categoryId = category.id;
    });

    afterEach(async () => {
      await prisma.discussion.deleteMany({ where: { labId: lab.id } });
    });

    it('should allow admin/manager to update category, reject member', async () => {
      const updateData = { name: 'Updated Category Name', description: 'Updated description' };

      // Admin can update
      const adminResponse = await adminAgent
        .put(`/api/admin/lab/${lab.id}/update-discussion/${categoryId}`)
        .send(updateData)
        .expect(200);
      expect(adminResponse.body.name).toBe(updateData.name);
      expect(adminResponse.body.description).toBe(updateData.description);

      // Reset for manager test
      await prisma.discussion.update({
        where: { id: categoryId },
        data: { name: 'Manager Test Category', description: 'For manager test' }
      });

      // Manager can update
      const managerResponse = await managerAgent
        .put(`/api/admin/lab/${lab.id}/update-discussion/${categoryId}`)
        .send({ name: 'Manager Updated', description: 'Manager description' })
        .expect(200);
      expect(managerResponse.body.name).toBe('Manager Updated');

      // Member cannot update
      await memberAgent
        .put(`/api/admin/lab/${lab.id}/update-discussion/${categoryId}`)
        .send(updateData)
        .expect(403);
    });

    it('should prevent duplicate category names within lab', async () => {
      // Create another category
      const category2 = await prisma.discussion.create({
        data: { labId: lab.id, name: 'Existing Category', description: 'Already exists' }
      });

      // Try to update first category to have same name as second
      await adminAgent
        .put(`/api/admin/lab/${lab.id}/update-discussion/${categoryId}`)
        .send({ name: 'Existing Category', description: 'Duplicate name' })
        .expect(400);
    });

    it('should protect default categories from name changes', async () => {
      // Create default categories
      const announcementCategory = await prisma.discussion.create({
        data: { labId: lab.id, name: 'Announcements', description: 'Default category' }
      });
      const generalCategory = await prisma.discussion.create({
        data: { labId: lab.id, name: 'General', description: 'Default category' }
      });

      // Try to change name of Announcements category
      await adminAgent
        .put(`/api/admin/lab/${lab.id}/update-discussion/${announcementCategory.id}`)
        .send({ name: 'Modified Announcements', description: 'Should fail' })
        .expect(400);

      // Try to change name of General category
      await adminAgent
        .put(`/api/admin/lab/${lab.id}/update-discussion/${generalCategory.id}`)
        .send({ name: 'Modified General', description: 'Should fail' })
        .expect(400);

      // But description updates should work
      await adminAgent
        .put(`/api/admin/lab/${lab.id}/update-discussion/${announcementCategory.id}`)
        .send({ description: 'Updated description only' })
        .expect(200);
    });

    it('should return 404 for non-existent category', async () => {
      await adminAgent
        .put(`/api/admin/lab/${lab.id}/update-discussion/99999`)
        .send({ name: 'Non-existent', description: 'Should fail' })
        .expect(404);
    });

    it('should return 404 for category in different lab', async () => {
      // Create another lab and category
      const otherLab = await prisma.lab.create({
        data: { name: 'Other Lab', location: 'Other Location', status: 'active' }
      });
      const otherCategory = await prisma.discussion.create({
        data: { labId: otherLab.id, name: 'Other Category', description: 'In different lab' }
      });

      await adminAgent
        .put(`/api/admin/lab/${lab.id}/update-discussion/${otherCategory.id}`)
        .send({ name: 'Cross-lab update', description: 'Should fail' })
        .expect(404);

      // Cleanup
      await prisma.discussion.delete({ where: { id: otherCategory.id } });
      await prisma.lab.delete({ where: { id: otherLab.id } });
    });
  });
});