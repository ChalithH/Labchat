import { prisma } from "../../prisma";
import request from "supertest";
import app from "../../app";

describe('Role Controller', () => {
  describe('GET /api/roles', () => {
    it('should return all roles', async () => {
      const res = await request(app).get('/api/role/get');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/roles/:id', () => {
    it('should return 404 if role not found', async () => {
      const res = await request(app).get('/api/role/get/9999999');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Role not found');
    });

    it('should return role if found', async () => {
      // Create a role to test retrieval
      const role = await prisma.role.create({
          data: {
              name: 'Test Role',
              permissionLevel: 10,
          },
      });

      const res = await request(app).get(`/api/role/get/${role.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', role.id);
      expect(res.body).toHaveProperty('name', 'Test Role');

      // Cleanup
      await prisma.role.delete({ where: { id: role.id } });
    });
  });
});
