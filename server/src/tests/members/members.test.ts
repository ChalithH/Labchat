import { prisma } from '../../prisma';
import request from 'supertest';
import app from '../../app';

describe('Member Controllers', () => {
  // Test data IDs that should exist in production seed data
  let testMemberId: number;
  let testUserId: number;
  let testLabId: number;
  let testStatusId: number;
  let testContactId: number;
  let testMemberStatusId: number;

  beforeAll(async () => {
    // Get test data from seeded production data
    const member = await prisma.labMember.findFirst({
      include: {
        user: true,
        memberStatus: true
      }
    });
    const status = await prisma.status.findFirst();
    const contact = await prisma.contact.findFirst();

    if (!member || !status || !contact) {
      throw new Error('Required seed data not found');
    }

    testMemberId = member.id;
    testUserId = member.userId;
    testLabId = member.labId;
    testStatusId = status.id;
    testContactId = contact.id;
  });

  afterEach(async () => {
    // Clean up any test member statuses created during tests
    if (testMemberStatusId) {
      try {
        await prisma.memberStatus.delete({ where: { id: testMemberStatusId } });
      } catch (error) {
        // Member status might not exist or already deleted
      }
      testMemberStatusId = 0;
    }
  });

  describe('Member Retrieval', () => {
    test('should get member by ID', async () => {
      const response = await request(app)
        .get(`/api/member/get/${testMemberId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testMemberId);
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('labId');
      expect(response.body).toHaveProperty('labRole');
    });

    test('should return 404 for non-existent member ID', async () => {
      const response = await request(app)
        .get('/api/member/get/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Lab member not found');
    });

    test('should get member by user ID', async () => {
      const response = await request(app)
        .get(`/api/member/get/user/${testUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('userId', testUserId);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('labId');
    });

    test('should return 404 for non-existent user ID', async () => {
      const response = await request(app)
        .get('/api/member/get/user/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Lab member not found');
    });

    test('should get member by user ID and lab ID', async () => {
      const response = await request(app)
        .get(`/api/member/get/user-lab/${testUserId}/${testLabId}`)
        .expect(200);

      expect(response.body).toHaveProperty('userId', testUserId);
      expect(response.body).toHaveProperty('labId', testLabId);
      expect(response.body).toHaveProperty('id');
    });

    test('should return 404 for non-existent user-lab combination', async () => {
      const response = await request(app)
        .get(`/api/member/get/user-lab/99999/${testLabId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Lab member not found');
    });

    test('should get member with status information', async () => {
      const response = await request(app)
        .get(`/api/member/get-with-status/${testMemberId}`)
        .expect(200);

      expect(response.body).toHaveProperty('memberID', testMemberId);
      expect(response.body).toHaveProperty('labID');
      expect(response.body).toHaveProperty('status');
      expect(Array.isArray(response.body.status)).toBe(true);
      expect(response.body).toHaveProperty('displayName');
      expect(response.body).toHaveProperty('firstName');
      expect(response.body).toHaveProperty('lastName');
    });

    test('should get memberships by user ID', async () => {
      const response = await request(app)
        .get(`/api/member/memberships/user/${testUserId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('userId', testUserId);
      expect(response.body[0]).toHaveProperty('labId');
    });

    test('should return 404 for user with no memberships', async () => {
      // Find a user with no active memberships
      const userWithNoMemberships = await prisma.user.findFirst({
        where: {
          labMembers: {
            none: {
              labRole: { permissionLevel: { gte: 0 } }
            }
          }
        }
      });

      if (userWithNoMemberships) {
        const response = await request(app)
          .get(`/api/member/memberships/user/${userWithNoMemberships.id}`)
          .expect(404);

        expect(response.body).toHaveProperty('error', 'No lab memberships found for this user');
      }
    });
  });

  describe('Status Management', () => {
    test('should get all statuses', async () => {
      const response = await request(app)
        .get('/api/member/statuses')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('statusName');
    });

    test('should set member status as active', async () => {
      // First, find an existing member status
      const existingMemberStatus = await prisma.memberStatus.findFirst({
        where: { memberId: testMemberId }
      });

      if (existingMemberStatus) {
        const response = await request(app)
          .post('/api/member/set-status')
          .send({
            memberId: testMemberId,
            statusId: existingMemberStatus.statusId
          })
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Status updated successfully');

        // Verify the status was set to active
        const updatedStatus = await prisma.memberStatus.findFirst({
          where: {
            memberId: testMemberId,
            statusId: existingMemberStatus.statusId
          }
        });
        expect(updatedStatus?.isActive).toBe(true);
      }
    });

    test('should return 400 for missing memberId or statusId in set status', async () => {
      const response = await request(app)
        .post('/api/member/set-status')
        .send({
          memberId: testMemberId
          // Missing statusId
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'memberId and statusId are required');
    });

    test('should return 404 for non-existent status for member', async () => {
      const response = await request(app)
        .post('/api/member/set-status')
        .send({
          memberId: testMemberId,
          statusId: 99999 // Non-existent status
        })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Status not found for this member');
    });
  });

  describe('Member Status CRUD Operations', () => {
  test('should create new member status', async () => {
    expect(testMemberId).toBeDefined();
    expect(testStatusId).toBeDefined();

    // Find a contact that belongs to the same user as the member
    const member = await prisma.labMember.findUnique({
      where: { id: testMemberId },
      include: { user: true }
    });

    if (!member) {
      throw new Error('Test member not found');
    }

    // Find a contact that belongs to this user
    const userContact = await prisma.contact.findFirst({
      where: { userId: member.userId }
    });

    if (!userContact) {
      // Create a contact for this user if none exists
      const createdContact = await prisma.contact.create({
        data: {
          userId: member.userId,
          type: "Email",
          info: `test${member.userId}@example.com`,
          name: "Test Contact"
        }
      });
      testContactId = createdContact.id;
    } else {
      testContactId = userContact.id;
    }

    const requestData = {
      memberId: testMemberId,
      statusId: testStatusId,
      contactId: testContactId
    };

    console.log('Sending request data:', requestData);

    const response = await request(app)
      .post('/api/member/member-status')
      .send(requestData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('memberId', testMemberId);
    expect(response.body).toHaveProperty('statusId', testStatusId);
    expect(response.body).toHaveProperty('contactId', testContactId);
    expect(response.body).toHaveProperty('isActive', false);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('contact');

    // Store for cleanup
    testMemberStatusId = response.body.id;
  });

  test('should return 400 for missing required fields in create member status', async () => {
    const response = await request(app)
      .post('/api/member/member-status')
      .send({
        memberId: testMemberId
        // Missing statusId
      })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'memberId and statusId are required');
  });

  test('should return 404 for non-existent member in create member status', async () => {
    const response = await request(app)
      .post('/api/member/member-status')
      .send({
        memberId: 99999,
        statusId: testStatusId,
        contactId: testContactId
      })
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Member not found');
  });

  test('should return 404 for non-existent status in create member status', async () => {
    const response = await request(app)
      .post('/api/member/member-status')
      .send({
        memberId: testMemberId,
        statusId: 99999,
        contactId: testContactId
      })
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Status not found');
  });

  test('should return 409 for duplicate member status', async () => {
    // First create a member status
    const memberStatus = await prisma.memberStatus.create({
      data: {
        memberId: testMemberId,
        statusId: testStatusId,
        contactId: testContactId,
        isActive: false
      }
    });

    testMemberStatusId = memberStatus.id;

    // Try to create the same combination again
    const response = await request(app)
      .post('/api/member/member-status')
      .send({
        memberId: testMemberId,
        statusId: testStatusId,
        contactId: testContactId
      })
      .expect(409);

    expect(response.body).toHaveProperty('error', 'Member already has this status');
  });

  test('should update member status contact', async () => {
    // First create a member status
    const memberStatus = await prisma.memberStatus.create({
      data: {
        memberId: testMemberId,
        statusId: testStatusId,
        contactId: testContactId,
        isActive: false
      }
    });

    testMemberStatusId = memberStatus.id;

    // Find a different contact ID for the same user
    const member = await prisma.labMember.findUnique({
      where: { id: testMemberId },
      include: { user: true }
    });

    const differentContact = await prisma.contact.findFirst({
      where: {
        userId: member!.userId,
        id: { not: testContactId }
      }
    });

    if (differentContact) {
      const response = await request(app)
        .put(`/api/member/member-status/${memberStatus.id}`)
        .send({
          contactId: differentContact.id
        })
        .expect(200);

      expect(response.body).toHaveProperty('id', memberStatus.id);
      expect(response.body).toHaveProperty('contactId', differentContact.id);
      expect(response.body).toHaveProperty('contact');
    } else {
      // If no different contact exists, create one for testing
      const newContact = await prisma.contact.create({
        data: {
          userId: member!.userId,
          type: "Phone",
          info: "123-456-7890",
          name: "Test Phone Contact"
        }
      });

      const response = await request(app)
        .put(`/api/member/member-status/${memberStatus.id}`)
        .send({
          contactId: newContact.id
        })
        .expect(200);

      expect(response.body).toHaveProperty('id', memberStatus.id);
      expect(response.body).toHaveProperty('contactId', newContact.id);
      expect(response.body).toHaveProperty('contact');

      // Clean up the created contact
      await prisma.contact.delete({ where: { id: newContact.id } });
    }
  });

  test('should return 404 for non-existent member status in update', async () => {
    const response = await request(app)
      .put('/api/member/member-status/99999')
      .send({
        contactId: testContactId
      })
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Member status not found');
  });

  test('should return 400 for invalid member status ID in update', async () => {
    const response = await request(app)
      .put('/api/member/member-status/invalid')
      .send({
        contactId: testContactId
      })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Invalid member status ID');
  });

  test('should not delete active member status', async () => {
    // First create an active member status
    const memberStatus = await prisma.memberStatus.create({
      data: {
        memberId: testMemberId,
        statusId: testStatusId,
        contactId: testContactId,
        isActive: true
      }
    });

    testMemberStatusId = memberStatus.id;

    const response = await request(app)
      .delete(`/api/member/member-status/${memberStatus.id}`)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Cannot delete active status');
  });

  test('should delete inactive member status', async () => {
    // First create an inactive member status
    const memberStatus = await prisma.memberStatus.create({
      data: {
        memberId: testMemberId,
        statusId: testStatusId,
        contactId: testContactId,
        isActive: false
      }
    });

    const response = await request(app)
      .delete(`/api/member/member-status/${memberStatus.id}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Member status deleted successfully');

    // Verify it was deleted
    const deletedStatus = await prisma.memberStatus.findUnique({
      where: { id: memberStatus.id }
    });
    expect(deletedStatus).toBeNull();
  });

  test('should return 404 for non-existent member status in delete', async () => {
    const response = await request(app)
      .delete('/api/member/member-status/99999')
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Member status not found');
  });

  test('should return 400 for invalid member status ID in delete', async () => {
    const response = await request(app)
      .delete('/api/member/member-status/invalid')
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Invalid member status ID');
  });
});


  describe('Data Consistency', () => {
    test('setting status should make only one status active', async () => {
      // Get a member with multiple statuses
      const memberWithStatuses = await prisma.labMember.findFirst({
        where: {
          memberStatus: {
            some: {}
          }
        },
        include: {
          memberStatus: true
        }
      });

      if (memberWithStatuses && memberWithStatuses.memberStatus.length > 1) {
        const statusToActivate = memberWithStatuses.memberStatus[0];

        await request(app)
          .post('/api/member/set-status')
          .send({
            memberId: memberWithStatuses.id,
            statusId: statusToActivate.statusId
          })
          .expect(200);

        // Verify only one status is active
        const activeStatuses = await prisma.memberStatus.findMany({
          where: {
            memberId: memberWithStatuses.id,
            isActive: true
          }
        });

        expect(activeStatuses).toHaveLength(1);
        expect(activeStatuses[0].statusId).toBe(statusToActivate.statusId);
      }
    });

    test('member should be retrievable by all ID combinations', async () => {
      // Test that we can retrieve the same member using different endpoints
      const memberByIdResponse = await request(app)
        .get(`/api/member/get/${testMemberId}`)
        .expect(200);

      const memberByUserIdResponse = await request(app)
        .get(`/api/member/get/user/${testUserId}`)
        .expect(200);

      const memberByUserLabResponse = await request(app)
        .get(`/api/member/get/user-lab/${testUserId}/${testLabId}`)
        .expect(200);

      // All should return the same member ID
      expect(memberByIdResponse.body.id).toBe(testMemberId);
      expect(memberByUserIdResponse.body.id).toBe(testMemberId);
      expect(memberByUserLabResponse.body.id).toBe(testMemberId);
    });
  });
});