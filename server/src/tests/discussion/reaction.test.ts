import request from 'supertest';
import app from '../../app';
import { prisma } from '../../prisma';

let memberId: number;
let postId: number;
let replyId: number;
let reactionId: number;

describe('Discussion Reaction Routes', () => {
  beforeAll(async () => {
    // Clean up
    await prisma.discussionPostReaction.deleteMany();
    await prisma.discussionReplyReaction.deleteMany();
    await prisma.discussionReply.deleteMany();
    await prisma.discussionPost.deleteMany();
    await prisma.discussion.deleteMany();
    await prisma.postReaction.deleteMany();
    await prisma.replyReaction.deleteMany();

    // Setup base data
    const user = await prisma.user.create({
      data: {
        roleId: 2,
        universityId: `U${Date.now()}`,
        username: `reactiontester_${Date.now()}`,
        loginEmail: `reactiontester_${Date.now()}@test.com`,
        loginPassword: 'Pass123!',
        firstName: 'Test',
        lastName: 'React',
        displayName: 'Test React',
        jobTitle: 'Engineer',
        office: 'Lab B',
        bio: 'Testing reactions'
      }
    });

    const lab = await prisma.lab.create({
      data: {
        name: 'Reaction Lab',
        location: 'Block D',
        status: 'Active'
      }
    });

    const labRole = await prisma.labRole.create({
      data: {
        name: 'Member',
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

    memberId = member.id;

    const discussion = await prisma.discussion.create({
      data: {
        labId: lab.id,
        name: 'Reaction Testing Discussion'
      }
    });

    const post = await prisma.discussionPost.create({
      data: {
        title: 'Reactable Post',
        content: 'This post can be reacted to.',
        discussionId: discussion.id,
        memberId: member.id
      }
    });

    postId = post.id;

    const reply = await prisma.discussionReply.create({
      data: {
        content: 'This is a reply that can be reacted to.',
        postId: post.id,
        memberId: member.id
      }
    });

    replyId = reply.id;

    const postReact = await prisma.postReaction.create({
      data: {
        reactionName: 'Like',
        reaction: '👍'
      }
    });

    reactionId = postReact.id;

    await prisma.replyReaction.create({
      data: {
        reactionName: 'Clap',
        reaction: '👏'
      }
    });
  });

  it('GET /api/discussion/reactions/posts - should return all post reactions', async () => {
    const res = await request(app).get('/api/discussion/reactions/post');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/discussion/reactions/replies - should return all reply reactions', async () => {
    const res = await request(app).get('/api/discussion/reactions/reply');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/discussion/reactions/toggle - should add a reaction to a post', async () => {
    const res = await request(app).post('/api/discussion/reactions/toggle').send({
      targetId: postId,
      targetType: 'post',
      memberId,
      reactionId
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('postId', postId);
  });

  it('GET /api/discussion/reactions/posts/:id - should return reactions for a post', async () => {
    const res = await request(app).get(`/api/discussion/reactions/post/${postId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/discussion/reactions/toggle - should remove the reaction from post', async () => {
    const res = await request(app).post('/api/discussion/reactions/toggle').send({
      targetId: postId,
      targetType: 'post',
      memberId,
      reactionId
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/removed/i);
  });

  it('POST /api/discussion/reactions/toggle - should add a reaction to a reply', async () => {
    const replyReaction = await prisma.replyReaction.findFirst();

    const res = await request(app).post('/api/discussion/reactions/toggle').send({
      targetId: replyId,
      targetType: 'reply',
      memberId,
      reactionId: replyReaction!.id
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('replyId', replyId);
  });

  it('GET /api/discussion/reactions/replies/:id - should return reactions for a reply', async () => {
    const res = await request(app).get(`/api/discussion/reactions/reply/${replyId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/discussion/reactions/toggle - should remove reaction from reply', async () => {
    const replyReaction = await prisma.replyReaction.findFirst();

    const res = await request(app).post('/api/discussion/reactions/toggle').send({
      targetId: replyId,
      targetType: 'reply',
      memberId,
      reactionId: replyReaction!.id
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/removed/i);
  });

  afterAll(async () => {
    await prisma.discussionReplyReaction.deleteMany();
    await prisma.discussionPostReaction.deleteMany();
    await prisma.discussionReply.deleteMany();
    await prisma.discussionPost.deleteMany();
    await prisma.discussion.deleteMany();
    await prisma.postReaction.deleteMany();
    await prisma.replyReaction.deleteMany();
  });
});
