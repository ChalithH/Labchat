import { prisma } from "../../prisma";
import request from "supertest";
import app from "../../app";

describe('User API Routes', () => {
  let userId: number;

  const testUser = {
    roleId: 2,
    universityId: 'U12345678',
    username: `testuser_${Date.now()}`,
    loginEmail: `testuser_${Date.now()}@test.com`,
    loginPassword: 'SecurePassword123!',
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    jobTitle: 'Research Assistant',
    office: 'Room 205',
    bio: 'Passionate researcher in molecular biology',
  };

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } });
    }
    await prisma.$disconnect();
  });

  test('POST /api/user/ - createUser', async () => {
    const res = await request(app)
      .post('/api/user/')
      .send(testUser)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.username).toBe(testUser.username);
    userId = res.body.id;
  });

  test('PUT /api/user/update/:id - updateUser', async () => {
    const updateData = { jobTitle: 'Senior Researcher', office: 'Lab 1B' };
    const res = await request(app)
      .put(`/api/user/update/${userId}`)
      .send(updateData)
      .expect(200);

    expect(res.body.jobTitle).toBe(updateData.jobTitle);
    expect(res.body.office).toBe(updateData.office);
  });

  test('GET /api/user/get - getUsers', async () => {
    const res = await request(app)
      .get('/api/user/get')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/user/get/:id - getUserById', async () => {
    const res = await request(app)
      .get(`/api/user/get/${userId}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', userId);
    expect(res.body.username).toBe(testUser.username);
  });

  test('GET /api/user/:userId/contacts - getUserContacts', async () => {
    const res = await request(app)
      .get(`/api/user/${userId}/contacts`)
      .expect(200);

    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/user/available-labs/:id - getUserAvailableLabs', async () => {
    const res = await request(app)
      .get(`/api/user/available-labs/${userId}`)
      .expect(200);

    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body)).toBe(true);
  });
});
