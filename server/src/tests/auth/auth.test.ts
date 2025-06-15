import request from 'supertest';
import app from '../../app';
import { prisma } from '../..';
import bcrypt from 'bcryptjs';

describe('Auth Integration Tests', () => {
  let testUser: {
    roleId: number;
    universityId: string;
    username: string;
    loginEmail: string;
    loginPassword: string;
    firstName: string;
    lastName: string;
    displayName: string;
    jobTitle: string;
    office: string;
    bio: string;
  };

  let agent = request.agent(app);

  beforeAll(async () => {
    const timestamp = Date.now();
    const plainPassword = 'SecurePassword123!';

    testUser = {
      roleId: 2,
      universityId: 'U12345678',
      username: `testuser_${timestamp}`,
      loginEmail: `testuser_${timestamp}@test.com`,
      loginPassword: plainPassword,
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'John Doe',
      jobTitle: 'Research Assistant',
      office: 'Room 205',
      bio: 'Passionate researcher in molecular biology',
    };

    await prisma.user.deleteMany({ where: { loginEmail: testUser.loginEmail } });

    const hashedPassword = await bcrypt.hash(testUser.loginPassword, 10);

    await prisma.user.create({
      data: {
        roleId: testUser.roleId,
        universityId: testUser.universityId,
        username: testUser.username,
        loginEmail: testUser.loginEmail,
        loginPassword: hashedPassword,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        displayName: testUser.displayName,
        jobTitle: testUser.jobTitle,
        office: testUser.office,
        bio: testUser.bio,
      }
    });
  });

  afterAll(async () => {
    if (testUser?.loginEmail) {
      await prisma.user.deleteMany({ where: { loginEmail: testUser.loginEmail } });
    }
    await prisma.$disconnect();
  });

  it('should login successfully and establish session', async () => {
    const res = await agent.post('/api/auth/login').send({
      loginEmail: testUser.loginEmail,
      loginPassword: testUser.loginPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('message', 'Login successful');
  });

  it('should return user status when authenticated', async () => {
    const res = await agent.get('/api/auth/status');
    expect(res.status).toBe(200);
  });

  it('should deny status when not authenticated', async () => {
    const res = await request(app).get('/api/auth/status');
    expect(res.status).toBe(401);
  });

  it('should logout successfully', async () => {
    const res = await agent.get('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('msg', 'Successfully logged out');
  });

  it('should check lab access permission - unauthorized without login', async () => {
    const res = await request(app).get('/api/auth/check-lab-access/1');
    expect(res.status).toBe(401);
  });
});
