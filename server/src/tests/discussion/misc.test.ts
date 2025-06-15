import { prisma } from "../../prisma";
import request from "supertest";
import app from "../../app";  

let labId: number;
let discussionId: number;
let postId1: number;
let postId2: number;

describe('Discussion Posts Endpoints', () => {
  beforeAll(async () => {
    // Create a lab
    const lab = await prisma.lab.create({
      data: {
        name: 'Test Lab',
        location: 'Test Location',
        status: 'Active'
      }
    });
    labId = lab.id;

    // Create discussions
    const discussion = await prisma.discussion.create({
      data: {
        labId,
        name: 'General Discussion',
      }
    });
    discussionId = discussion.id;

    // Create posts for recent/popular tests
    const post1 = await prisma.discussionPost.create({
      data: {
        title: 'Recent Post 1',
        content: 'Content for recent post 1',
        discussionId,
        memberId: 1 // assuming memberId 1 exists or mock as needed
      }
    });
    postId1 = post1.id;

    const post2 = await prisma.discussionPost.create({
      data: {
        title: 'Popular Post 1',
        content: 'Content for popular post 1',
        discussionId,
        memberId: 1
      }
    });
    postId2 = post2.id;

    // You can create replies or reactions here to influence popularity if needed
  });

  afterAll(async () => {
  });

  describe('GET /api/discussion/recent/:lab', () => {
    it('should return recent posts for a lab', async () => {
      const res = await request(app).get(`/api/discussion/recent/${labId}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('tags');
    });

    it('should return 200 with empty array for lab with no posts', async () => {
      const res = await request(app).get(`/api/discussion/recent/999999`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe('GET /api/discussion/popular/:id', () => {
    it('should return popular posts limited by amount', async () => {
      const res = await request(app).get(`/api/discussion/popular/5`).query({ labId });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(5);
    });

    it('should return 200 with empty array if no posts found', async () => {
      const res = await request(app).get(`/api/discussion/popular/5`).query({ labId: 999999 });
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /api/discussion/mixed/:id', () => {
    it('should return a mix of recent and popular posts without duplicates', async () => {
      const res = await request(app).get(`/api/discussion/mixed/10`).query({ labId });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const ids = res.body.map((p: any) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
