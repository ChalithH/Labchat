import request from 'supertest';
import app from '../../app';
import { prisma } from '../../prisma';

let tagId: number;
let postId: number;
let tagAssignmentId: number;

describe('Discussion Tag Routes', () => {
  beforeAll(async () => {
    // Clean up related tables
    await prisma.discussionPostTag.deleteMany();
    await prisma.discussionPost.deleteMany();
    await prisma.postTag.deleteMany();

    // Create user, lab, member, discussion, post for assignment test
    const user = await prisma.user.create({
      data: {
        roleId: 2,
        universityId: `U${Date.now()}`,
        username: `tagtester_${Date.now()}`,
        loginEmail: `tagtester_${Date.now()}@test.com`,
        loginPassword: 'TestPassword123!',
        firstName: 'Jane',
        lastName: 'Doe',
        displayName: 'Jane Doe',
        jobTitle: 'Developer',
        office: 'Lab A',
        bio: 'Testing bio'
      }
    });

    const lab = await prisma.lab.create({
      data: {
        name: 'Tag Testing Lab',
        location: 'Building B',
        status: 'Active'
      }
    });

    const labRole = await prisma.labRole.create({
      data: {
        name: 'Tester',
        permissionLevel: 1
      }
    });

    const member = await prisma.labMember.create({
      data: {
        userId: user.id,
        labId: lab.id,
        labRoleId: labRole.id
      }
    });

    const discussion = await prisma.discussion.create({
      data: {
        labId: lab.id,
        name: 'Tag Discussion'
      }
    });

    const post = await prisma.discussionPost.create({
      data: {
        title: 'Tagged Post',
        content: 'This post will have tags.',
        discussionId: discussion.id,
        memberId: member.id
      }
    });

    postId = post.id;

    // Create a tag for initial use
    const tag = await prisma.postTag.create({
      data: {
        tag: `InitialTag_${Date.now()}`
      }
    });

    tagId = tag.id;
  });

  it('GET /api/discussion/tags - should return all tags', async () => {
    const res = await request(app).get('/api/discussion/tags');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((tag: { id: number; }) => tag.id === tagId)).toBe(true);
  });

  it('GET /api/discussion/tags/:id - should return a tag by ID', async () => {
    const res = await request(app).get(`/api/discussion/tags/${tagId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', tagId);
    expect(res.body).toHaveProperty('tag');
  });

  it('POST /api/discussion/tags - should create a new tag', async () => {
    const res = await request(app)
      .post('/api/discussion/tags')
      .send({ tag: `CreatedTag_${Date.now()}` });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('tag');
  });

  it('PUT /api/discussion/tags/:id - should update an existing tag', async () => {
    const newTagName = `UpdatedTag_${Date.now()}`;
    const res = await request(app)
      .put(`/api/discussion/tags/${tagId}`)
      .send({ tag: newTagName });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', tagId);
    expect(res.body.tag).toBe(newTagName);
  });

  it('POST /api/discussion/posts/:postId/tags - should assign a tag to a post', async () => {
    const tag = await prisma.postTag.create({
      data: { tag: `ToAssign_${Date.now()}` }
    });

    const res = await request(app)
      .post(`/api/discussion/posts/${postId}/tags`)
      .send({ postTagId: tag.id });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.postId).toBe(postId);

    tagAssignmentId = res.body.id;
  });

  it('GET /api/discussion/tags/post/:id - should return tags for a post', async () => {
    const res = await request(app).get(`/api/discussion/tags/post/${postId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('DELETE /api/discussion/posts/:postId/tags/:tagAssignmentId - should remove tag from post', async () => {
    const res = await request(app)
      .delete(`/api/discussion/posts/${postId}/tags/${tagAssignmentId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/removed/i);
  });

  it('DELETE /api/discussion/tags/:id - should delete a tag', async () => {
    const tag = await prisma.postTag.create({
      data: { tag: `ToDelete_${Date.now()}` }
    });

    const res = await request(app).delete(`/api/discussion/tags/${tag.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  afterAll(async () => {
    await prisma.discussionPostTag.deleteMany();
    await prisma.discussionPost.deleteMany();
    await prisma.discussion.deleteMany();
    await prisma.postTag.deleteMany();
  });
});
