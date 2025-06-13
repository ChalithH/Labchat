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

    if (!member || !status) {
      throw new Error('Required seed data not found');
    }

    testMemberId = member.id;
    testUserId = member.userId;
    testLabId = member.labId;
    testStatusId = status.id;
    testContactId = contact?.id || 1;
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
        .get(`/api/member/memberships/${testUserId}`)
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
          .get(`/api/member/memberships/${userWithNoMemberships.id}`)
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
      const response = await request(app)
        .post('/api/member/member-status')
        .send({
          memberId: testMemberId,
          statusId: testStatusId,
          contactId: testContactId
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('memberId', testMemberId);
      expect(response.body).toHaveProperty('statusId', testStatusId);
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
          statusId: testStatusId
        })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Member not found');
    });

    test('should return 404 for non-existent status in create member status', async () => {
      const response = await request(app)
        .post('/api/member/member-status')
        .send({
          memberId: testMemberId,
          statusId: 99999
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
          contactId: 1,
          isActive: false
        }
      });

      testMemberStatusId = memberStatus.id;

      const response = await request(app)
        .put(`/api/member/member-status/${memberStatus.id}`)
        .send({
          contactId: testContactId
        })
        .expect(200);

      expect(response.body).toHaveProperty('id', memberStatus.id);
      expect(response.body).toHaveProperty('contactId', testContactId);
      expect(response.body).toHaveProperty('contact');
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

  describe('Validation and Edge Cases', () => {
    test('should handle invalid member ID format gracefully', async () => {
      const response = await request(app)
        .get('/api/member/get/invalid')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to retrieve lab member');
    });

    test('should handle invalid user ID format in user-lab endpoint', async () => {
      const response = await request(app)
        .get(`/api/member/get/user-lab/invalid/${testLabId}`)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to retrieve lab member');
    });

    test('should create member status without contact ID', async () => {
      const response = await request(app)
        .post('/api/member/member-status')
        .send({
          memberId: testMemberId,
          statusId: testStatusId
          // No contactId provided
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('contactId', null);

      // Store for cleanup
      testMemberStatusId = response.body.id;
    });

    test('should return 404 for contact that does not belong to user', async () => {
      // Find a contact that belongs to a different user
      const differentUserContact = await prisma.contact.findFirst({
        where: {
          userId: { not: testUserId }
        }
      });

      if (differentUserContact) {
        const response = await request(app)
          .post('/api/member/member-status')
          .send({
            memberId: testMemberId,
            statusId: testStatusId,
            contactId: differentUserContact.id
          })
          .expect(404);

        expect(response.body).toHaveProperty('error', 'Contact not found or does not belong to this user');
      }
    });

    test('should handle member with no status information gracefully', async () => {
      // This test verifies the get-with-status endpoint handles members with no statuses
      const response = await request(app)
        .get(`/api/member/get-with-status/${testMemberId}`)
        .expect(200);

      expect(response.body).toHaveProperty('memberID', testMemberId);
      expect(response.body).toHaveProperty('status');
      expect(Array.isArray(response.body.status)).toBe(true);
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