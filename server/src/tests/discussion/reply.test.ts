import request from 'supertest';
import app from '../../app';
import { prisma } from '../../prisma';

let memberId: number;
let postId: number;
let replyId: number;

describe('Discussion Reply Routes', () => {
  beforeAll(async () => {
    await prisma.discussionReply.deleteMany();
    await prisma.discussionPost.deleteMany();
    await prisma.discussion.deleteMany();

    const user = await prisma.user.create({
      data: {
        roleId: 2,
        universityId: `U${Date.now()}`,
        username: `replytester_${Date.now()}`,
        loginEmail: `replytester_${Date.now()}@test.com`,
        loginPassword: 'Pass123!',
        firstName: 'Reply',
        lastName: 'Tester',
        displayName: 'Reply Tester',
        jobTitle: 'Intern',
        office: 'Lab A',
        bio: 'Reply testing'
      }
    });

    const lab = await prisma.lab.create({
      data: {
        name: 'Reply Lab',
        location: 'Block C',
        status: 'Active'
      }
    });

    const role = await prisma.labRole.create({ data: { name: 'Member', permissionLevel: 1 } });

    const member = await prisma.labMember.create({
      data: { userId: user.id, labId: lab.id, labRoleId: role.id }
    });

    memberId = member.id;

    const discussion = await prisma.discussion.create({
      data: {
        labId: lab.id,
        name: 'Reply Testing Discussion'
      }
    });

    const post = await prisma.discussionPost.create({
      data: {
        title: 'Post with replies',
        content: 'Some content',
        discussionId: discussion.id,
        memberId
      }
    });

    postId = post.id;

    const reply = await prisma.discussionReply.create({
      data: {
        content: 'Initial reply',
        postId,
        memberId
      }
    });

    replyId = reply.id;
  });

  it('GET /api/discussion/reply/:id - should return a reply by ID', async () => {
    const res = await request(app).get(`/api/discussion/reply/${replyId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', replyId);
  });

  it('GET /api/discussion/reply/:id - should return 404 for non-existent reply', async () => {
    const res = await request(app).get('/api/discussion/reply/9999999');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/discussion/reply/:id - should return 400 for invalid ID', async () => {
    const res = await request(app).get('/api/discussion/reply/abc');
    expect(res.statusCode).toBe(400);
  });

  it('GET /api/discussion/replies/post/:id - should return replies for post', async () => {
    const res = await request(app).get(`/api/discussion/replies/post/${postId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/discussion/reply - should create a reply', async () => {
    const res = await request(app).post('/api/discussion/reply').send({
      content: 'New test reply',
      postId,
      memberId
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('POST /api/discussion/reply - should fail with missing fields', async () => {
    const res = await request(app).post('/api/discussion/reply').send({
      content: 'Missing postId and memberId'
    });

    expect(res.statusCode).toBe(400);
  });

  it('PUT /api/discussion/reply/:id - should update a reply', async () => {
    const res = await request(app).put(`/api/discussion/reply/${replyId}`).send({
      content: 'Updated reply content'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('content', 'Updated reply content');
  });

  it('PUT /api/discussion/reply/:id - should fail on invalid ID or missing content', async () => {
    const res = await request(app).put('/api/discussion/reply/abc').send({});
    expect(res.statusCode).toBe(400);
  });

  it('PUT /api/discussion/reply/:id - should return 404 on non-existent reply', async () => {
    const res = await request(app).put('/api/discussion/reply/999999').send({
      content: 'Should not update'
    });

    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/discussion/reply/:id - should delete a reply', async () => {
    const newReply = await prisma.discussionReply.create({
      data: {
        content: 'Reply to delete',
        postId,
        memberId
      }
    });

    const res = await request(app).delete(`/api/discussion/reply/${newReply.id}`);
    expect(res.statusCode).toBe(204);
  });

  it('DELETE /api/discussion/reply/:id - should return 400 on invalid ID', async () => {
    const res = await request(app).delete('/api/discussion/reply/abc');
    expect(res.statusCode).toBe(400);
  });

  it('DELETE /api/discussion/reply/:id - should return 404 on non-existent reply', async () => {
    const res = await request(app).delete('/api/discussion/reply/9999999');
    expect(res.statusCode).toBe(404);
  });

  afterAll(async () => {
    await prisma.discussionReply.deleteMany();
    await prisma.discussionPost.deleteMany();
    await prisma.discussion.deleteMany();
  });
});
