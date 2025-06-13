import { prisma } from '../../index';

describe('User Controller', () => {
  test('should create a new user', async () => {
    const role = await prisma.role.findFirst();
    if (!role) throw new Error('No role found in seed data');

    const userData = {
      roleId: role.id,
      universityId: 'TEST123',
      username: 'testuser',
      loginEmail: 'test@example.com',
      loginPassword: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      displayName: 'Test User'
    };

    const user = await prisma.user.create({
      data: userData
    });

    expect(user).toHaveProperty('id');
    expect(user.username).toBe('testuser');

    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
  });

  test('should find user by username', async () => {
    // Using existing seeded data
    const user = await prisma.user.findFirst({
      where: { username: { not: undefined } }
    });

    expect(user).toBeDefined();
    expect(user?.username).toBeTruthy();
  });
});
