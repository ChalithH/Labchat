import { prisma } from "../../prisma";
import request from "supertest";
import app from "../../app";

let userId: number;
let labId: number;
let memberId: number;
let discussionId: number;
let postId: number;
let tagId: number;

describe('Discussion Post Controller Routes', () => {
  beforeAll(async () => {
    // Clean up database and create necessary records
    await prisma.discussionPostTag.deleteMany();
    await prisma.discussionPostReaction.deleteMany();
    await prisma.discussionReply.deleteMany();
    await prisma.discussionPost.deleteMany();
    await prisma.discussion.deleteMany();
    await prisma.postTag.deleteMany();

    // Create user
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
    });
    userId = user.id;

    // Create lab
    const lab = await prisma.lab.create({
      data: {
        name: 'Test Lab',
        location: 'Building A',
        status: 'Active',
      },
    });
    labId = lab.id;

    // Create lab role
    const labRole = await prisma.labRole.create({
      data: {
        name: 'Researcher',
        permissionLevel: 1,
      },
    });

    // Create lab member
    const member = await prisma.labMember.create({
      data: {
        userId: user.id,
        labId: lab.id,
        labRoleId: labRole.id,
      },
    });
    memberId = member.id;

    // Create discussion category
    const discussion = await prisma.discussion.create({
      data: {
        labId: lab.id,
        name: 'General',
      },
    });
    discussionId = discussion.id;

    // Create announcements discussion
    await prisma.discussion.create({
      data: {
        labId: lab.id,
        name: 'Announcements',
      },
    });

    // Create a tag for testing
    const tag = await prisma.postTag.create({
      data: {
        tag: 'TestTag',
      },
    });
    tagId = tag.id;
  });

  describe('POST /api/discussion/post - Create Post', () => {
    it('should create a post successfully', async () => {
      const postData = {
        discussionId: discussionId,
        memberId: userId, // Note: controller looks up member by userId
        title: 'Test Post Title',
        content: 'This is test post content.',
        isPinned: false,
        isAnnounce: false,
        selectedTagIds: [tagId]
      };

      const res = await request(app)
        .post('/api/discussion/post')
        .send(postData);

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe(postData.title);
      expect(res.body.content).toBe(postData.content);
      expect(res.body.discussionId).toBe(discussionId);
      expect(res.body.memberId).toBe(memberId);

      postId = res.body.id;
      expect(postId).toBeDefined();
    });

    it('should return 400 when missing required fields', async () => {
      const res = await request(app)
        .post('/api/discussion/post')
        .send({
          title: 'Test Post',
          // Missing discussionId, memberId, content
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/Missing fields/i);
    });

    it('should return 400 when member not found', async () => {
      const res = await request(app)
        .post('/api/discussion/post')
        .send({
          discussionId: discussionId,
          memberId: 99999, // Non-existent member
          title: 'Test Post',
          content: 'Test content'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/No lab member found/i);
    });
  });

  describe('GET /api/discussion/post/:id - Get Post By ID', () => {
    it('should retrieve post by ID successfully', async () => {
      const res = await request(app)
        .get(`/api/discussion/post/${postId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(postId);
      expect(res.body.title).toBe('Test Post Title');
      expect(res.body.member).toBeTruthy();
      expect(res.body.member.user).toBeTruthy();
      expect(res.body.tags).toBeInstanceOf(Array);
    });

    it('should return 400 for invalid ID', async () => {
      const res = await request(app)
        .get('/api/discussion/post/invalid');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/Failed to parse an ID/i);
    });

    it('should return 400 for non-existent post', async () => {
      const res = await request(app)
        .get('/api/discussion/post/99999');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/No post found with an ID of/i);
    });
  });

  describe('PUT /api/discussion/post/:id - Edit Post', () => {
    it('should update post successfully', async () => {
      const updateData = {
        title: 'Updated Test Post Title',
        content: 'Updated test post content.',
        isPinned: true,
        selectedTagIds: []
      };

      const res = await request(app)
        .put(`/api/discussion/post/${postId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe(updateData.title);
      expect(res.body.content).toBe(updateData.content);
      expect(res.body.isPinned).toBe(true);
    });

    it('should return 400 for invalid ID', async () => {
      const res = await request(app)
        .put('/api/discussion/post/invalid')
        .send({ title: 'Updated Title' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/Failed to parse an ID/i);
    });

    it('should return 400 for non-existent post', async () => {
      const res = await request(app)
        .put('/api/discussion/post/99999')
        .send({ title: 'Updated Title' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/No post found with ID/i);
    });
  });

  describe('GET /api/discussion/member-posts/:id - Get Posts By Member', () => {
    it('should retrieve posts by member successfully', async () => {
      const res = await request(app)
        .get(`/api/discussion/member-posts/${memberId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].memberId).toBe(memberId);
    });

    it('should return 400 for invalid member ID', async () => {
      const res = await request(app)
        .get('/api/discussion/member-posts/invalid');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/Failed to parse a member ID/i);
    });

    it('should return 400 for non-existent member', async () => {
      const res = await request(app)
        .get('/api/discussion/member-posts/99999');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/No member found with an ID of/i);
    });
  });

  describe('POST /api/discussion/title-posts - Get Posts By Title', () => {
    it('should find posts by title successfully', async () => {
      const res = await request(app)
        .post('/api/discussion/title-posts')
        .send({ title: 'Updated Test' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].title).toMatch(/Updated Test/i);
    });

    it('should return empty array for non-matching title', async () => {
      const res = await request(app)
        .post('/api/discussion/title-posts')
        .send({ title: 'NonExistentTitle12345' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/discussion/title-posts')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/Failed to obtain a title/i);
    });
  });

  describe('GET /api/discussion/announcements/lab/:labId - Get Announcements By Lab', () => {
    beforeAll(async () => {
      // Create an announcement post
      const announcementDiscussion = await prisma.discussion.findFirst({
        where: { labId: labId, name: 'Announcements' }
      });

      if (announcementDiscussion) {
        await prisma.discussionPost.create({
          data: {
            title: 'Test Announcement',
            content: 'This is a test announcement.',
            discussionId: announcementDiscussion.id,
            memberId: memberId,
            isAnnounce: true
          }
        });
      }
    });

    it('should retrieve announcements by lab successfully', async () => {
      const res = await request(app)
        .get(`/api/discussion/announcements/lab/${labId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Should have at least the announcement we created
      if (res.body.length > 0) {
        expect(res.body[0].discussion).toBeTruthy();
      }
    });

    it('should return 400 for invalid lab ID', async () => {
      const res = await request(app)
        .get('/api/discussion/announcements/lab/invalid');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/Failed to parse a lab ID/i);
    });

    it('should return 400 for non-existent lab', async () => {
      const res = await request(app)
        .get('/api/discussion/announcements/lab/99999');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/No lab found with an ID of/i);
    });
  });

  describe('DELETE /api/discussion/post/:id - Delete Post', () => {
    it('should delete post successfully', async () => {
      const res = await request(app)
        .delete(`/api/discussion/post/${postId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.msg).toMatch(/Successfully deleted post/i);

      // Verify post is deleted
      const getRes = await request(app)
        .get(`/api/discussion/post/${postId}`);
      expect(getRes.statusCode).toBe(400);
    });

    it('should return 400 for invalid ID', async () => {
      const res = await request(app)
        .delete('/api/discussion/post/invalid');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/Failed to parse an ID/i);
    });

    it('should return 400 for non-existent post', async () => {
      const res = await request(app)
        .delete('/api/discussion/post/99999');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/No post found with ID/i);
    });
  });

  afterAll(async () => {
    // Clean up all test data
    await prisma.discussionPostTag.deleteMany();
    await prisma.discussionPostReaction.deleteMany();
    await prisma.discussionReply.deleteMany();
    await prisma.discussionPost.deleteMany();
    await prisma.discussion.deleteMany();
    await prisma.postTag.deleteMany();
  });
});