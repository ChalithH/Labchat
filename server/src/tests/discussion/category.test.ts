import { prisma } from "../../prisma";
import request from "supertest";
import app from "../../app";

let postId: number;
let tagAssignmentId: number;

describe('Discussion Category Routes', () => {
  beforeAll(async () => {
    // Clean up database and create necessary records
    await prisma.discussionPostTag.deleteMany();
    await prisma.discussionReply.deleteMany();
    await prisma.discussionPostReaction.deleteMany();
    await prisma.discussionPost.deleteMany();
    await prisma.discussion.deleteMany();
    await prisma.postTag.deleteMany();

    const user = await prisma.user.create({
          data: {
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
          }
        })

    const lab = await prisma.lab.create({
      data: {
        name: 'Test Lab',
        location: 'Building A',
        status: 'Active',
      },
    });

    const labRole = await prisma.labRole.create({
      data: {
        name: 'Researcher',
        permissionLevel: 1,
      },
    });

    const member = await prisma.labMember.create({
      data: {
        userId: user.id,
        labId: lab.id,
        labRoleId: labRole.id,
      },
    });

    const discussion = await prisma.discussion.create({
      data: {
        labId: lab.id,
        name: 'General',
      },
    });

    const post = await prisma.discussionPost.create({
      data: {
        title: 'Test Post',
        content: 'This is a test post.',
        discussionId: discussion.id,
        memberId: member.id,
      },
    });

    postId = post.id;
  });

  it('POST /api/discussion/posts/:postId/categories - should assign a tag to a post', async () => {
    const tag = await prisma.postTag.create({
      data: {
        tag: 'TagToAssign',
      },
    });

    const res = await request(app)
      .post(`/api/discussion/posts/${postId}/categories`)
      .send({ postTagId: tag.id });

    expect(res.statusCode).toBe(201);
    expect(res.body.postId).toBe(postId);

    tagAssignmentId = res.body.id;
    expect(tagAssignmentId).toBeDefined();
  });

  it('DELETE /api/discussion/posts/:postId/categories/:tagAssignmentId - should remove a tag from a post', async () => {
    expect(tagAssignmentId).toBeDefined();
    const res = await request(app).delete(`/api/discussion/posts/${postId}/categories/${tagAssignmentId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/removed/i);
  });

  it('DELETE /api/discussion/tags/:id - should delete the tag', async () => {
    const tag = await prisma.postTag.create({
        data: {
        tag: 'DeleteMe',
        },
    });

    const res = await request(app).delete(`/api/discussion/tags/${tag.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
});


  afterAll(async () => {
    await prisma.discussionPostTag.deleteMany();
    await prisma.discussionReply.deleteMany();
    await prisma.discussionPostReaction.deleteMany();
    await prisma.discussionPost.deleteMany();
    await prisma.discussion.deleteMany();
    await prisma.postTag.deleteMany();
  });
});
