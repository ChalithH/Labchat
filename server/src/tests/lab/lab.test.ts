import { prisma } from '../../prisma';
import request from 'supertest';
import app from '../../app';
import { AdmissionStatus } from '@prisma/client';

describe('Lab Controllers', () => {
  // Test data IDs that should exist in production seed data
  let testLabId: number;
  let testUserId: number;
  let testRoleId: number;
  let testMemberId: number;
  let testAdmissionId: number;

  beforeAll(async () => {
    // Get test data from seeded production data
    const lab = await prisma.lab.findFirst();
    const user = await prisma.user.findFirst();
    const role = await prisma.labRole.findFirst({
      where: { permissionLevel: { gte: 0 } }
    });
    const member = await prisma.labMember.findFirst();

    if (!lab || !user || !role) {
      throw new Error('Required seed data not found');
    }

    testLabId = lab.id;
    testUserId = user.id;
    testRoleId = role.id;
    testMemberId = member?.id || 1;
  });

  afterEach(async () => {
    // Clean up any test admission requests created during tests
    if (testAdmissionId) {
      try {
        await prisma.labAdmission.delete({ where: { id: testAdmissionId } });
      } catch (error) {
        // Admission might not exist or already deleted
      }
      testAdmissionId = 0;
    }
  });

  describe('Lab Controller', () => {
    test('should get lab by ID', async () => {
      const response = await request(app)
        .get(`/api/lab/${testLabId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testLabId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('location');
      expect(response.body).toHaveProperty('status');
    });

    test('should return 404 for non-existent lab', async () => {
      const response = await request(app)
        .get('/api/lab/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Lab not found');
    });

    test('should get all labs', async () => {
      const response = await request(app)
        .get('/api/lab/all')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('location');
    });

    test('should get lab members', async () => {
      const response = await request(app)
        .get(`/api/lab/getMembers/${testLabId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const member = response.body[0];
        expect(member).toHaveProperty('id');
        expect(member).toHaveProperty('displayName');
        expect(member).toHaveProperty('memberID');
        expect(member).toHaveProperty('labID');
        expect(member).toHaveProperty('labRoleId');
      }
    });

    test('should get lab members list (simplified)', async () => {
      const response = await request(app)
        .get(`/api/lab/getMembersList/${testLabId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const member = response.body[0];
        expect(member).toHaveProperty('id');
        expect(member).toHaveProperty('displayName');
        expect(member).toHaveProperty('memberID');
        expect(member).toHaveProperty('labID');
      }
    });

    test('should get lab roles', async () => {
      const response = await request(app)
        .get('/api/lab/roles')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('permissionLevel');
    });

    test('should get user labs', async () => {
      const response = await request(app)
        .get(`/api/lab/user/${testUserId}/labs`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('labId');
      }
    });

    test('should return 404 for non-existent user labs', async () => {
      const response = await request(app)
        .get('/api/lab/user/99999/labs')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });

    test('should not get lab role by ID as lab was just initalised', async () => {
        console.log("role", testRoleId, 'lab', testLabId)
      const response = await request(app)
        .get(`/api/lab/${testLabId}/role/${testRoleId}`)
        .expect(404);
    });
  });

  describe('Lab Admission Controller', () => {
    test('should create admission request', async () => {
      // Find a user who is not already a member of testLabId
      const nonMemberUser = await prisma.user.findFirst({
        where: {
          labMembers: {
            none: {
              labId: testLabId,
              labRole: { permissionLevel: { gte: 0 } }
            }
          }
        }
      });

      if (!nonMemberUser) {
        console.log('No non-member user found, skipping admission request test');
        return;
      }

      const admissionData = {
        labId: testLabId,
        userId: nonMemberUser.id,
        roleId: testRoleId
      };

      const response = await request(app)
        .post('/api/labAdmission/request')
        .send(admissionData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status', 'PENDING');
      expect(response.body.labId).toBe(testLabId);
      expect(response.body.userId).toBe(nonMemberUser.id);

      // Store for cleanup
      testAdmissionId = response.body.id;
    });

    test('should return 400 for missing required fields in admission request', async () => {
      const invalidData = {
        labId: testLabId
        // Missing userId and roleId
      };

      const response = await request(app)
        .post('/api/labAdmission/request')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should return 400 for user already member of lab', async () => {
      // Find a user who is already a member
      const existingMember = await prisma.labMember.findFirst({
        where: {
          labId: testLabId,
          labRole: { permissionLevel: { gte: 0 } }
        }
      });

      if (existingMember) {
        const admissionData = {
          labId: testLabId,
          userId: existingMember.userId,
          roleId: testRoleId
        };

        const response = await request(app)
          .post('/api/labAdmission/request')
          .send(admissionData)
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('already an active member');
      }
    });

    test('should get lab admission requests', async () => {
      const response = await request(app)
        .get(`/api/labAdmission/lab/${testLabId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const admission = response.body[0];
        expect(admission).toHaveProperty('id');
        expect(admission).toHaveProperty('status');
        expect(admission).toHaveProperty('user');
        expect(admission).toHaveProperty('lab');
        expect(admission).toHaveProperty('role');
      }
    });

    test('should get user admission requests', async () => {
      const response = await request(app)
        .get(`/api/labAdmission/user/${testUserId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const admission = response.body[0];
        expect(admission).toHaveProperty('id');
        expect(admission).toHaveProperty('status');
        expect(admission.userId).toBe(testUserId);
      }
    });

    test('should return 404 for non-existent user admission requests', async () => {
      const response = await request(app)
        .get('/api/labAdmission/user/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });

    test('should reject admission request', async () => {
      // First create an admission request
      const nonMemberUser = await prisma.user.findFirst({
        where: {
          labMembers: {
            none: {
              labId: testLabId,
              labRole: { permissionLevel: { gte: 0 } }
            }
          }
        }
      });

      if (!nonMemberUser) {
        console.log('No non-member user found, skipping rejection test');
        return;
      }

      const admission = await prisma.labAdmission.create({
        data: {
          labId: testLabId,
          userId: nonMemberUser.id,
          roleId: testRoleId,
          status: AdmissionStatus.PENDING
        }
      });

      testAdmissionId = admission.id;

      const response = await request(app)
        .put(`/api/labAdmission/reject/${admission.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.admissionRequest.status).toBe('REJECTED');
    });

    test('should withdraw admission request', async () => {
      // First create an admission request
      const nonMemberUser = await prisma.user.findFirst({
        where: {
          labMembers: {
            none: {
              labId: testLabId,
              labRole: { permissionLevel: { gte: 0 } }
            }
          }
        }
      });

      if (!nonMemberUser) {
        console.log('No non-member user found, skipping withdrawal test');
        return;
      }

      const admission = await prisma.labAdmission.create({
        data: {
          labId: testLabId,
          userId: nonMemberUser.id,
          roleId: testRoleId,
          status: AdmissionStatus.PENDING
        }
      });

      testAdmissionId = admission.id;

      const response = await request(app)
        .put(`/api/labAdmission/withdraw/${admission.id}`)
        .send({ userId: nonMemberUser.id })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.admissionRequest.status).toBe('WITHDRAWN');
    });

    test('should approve admission request and create lab member', async () => {
      // Find a user who is not already a member and ensure they have contact info
      const nonMemberUser = await prisma.user.findFirst({
        where: {
          labMembers: {
            none: {
              labId: testLabId,
              labRole: { permissionLevel: { gte: 0 } }
            }
          },
          contacts: {
            some: {}
          }
        }
      });

      if (!nonMemberUser) {
        console.log('No suitable non-member user found, skipping approval test');
        return;
      }

      // Create admission request
      const admission = await prisma.labAdmission.create({
        data: {
          labId: testLabId,
          userId: nonMemberUser.id,
          roleId: testRoleId,
          status: AdmissionStatus.PENDING
        }
      });

      testAdmissionId = admission.id;

      const response = await request(app)
        .put(`/api/labAdmission/approve/${admission.id}`)
        .send({ 
          roleId: testRoleId,
          isPCI: false 
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.admissionRequest.status).toBe('APPROVED');
      expect(response.body).toHaveProperty('labMember');

      // Clean up the created lab member
      if (response.body.labMember) {
        await prisma.labMember.delete({
          where: { id: response.body.labMember.id }
        });
      }
    });
  });

  describe('Validation Tests', () => {
    test('should return 404 for non-existent lab in admission request', async () => {
      const admissionData = {
        labId: 99999,
        userId: testUserId,
        roleId: testRoleId
      };

      const response = await request(app)
        .post('/api/labAdmission/request')
        .send(admissionData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Lab not found');
    });

    test('should return 404 for non-existent user in admission request', async () => {
      const admissionData = {
        labId: testLabId,
        userId: 99999,
        roleId: testRoleId
      };

      const response = await request(app)
        .post('/api/labAdmission/request')
        .send(admissionData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });

    test('should return 404 for non-existent role in admission request', async () => {
      const admissionData = {
        labId: testLabId,
        userId: testUserId,
        roleId: 99999
      };

      const response = await request(app)
        .post('/api/labAdmission/request')
        .send(admissionData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Lab role not found');
    });

    test('should return 400 when trying to reject non-pending admission', async () => {
      // Create an already rejected admission
      const nonMemberUser = await prisma.user.findFirst({
        where: {
          labMembers: {
            none: {
              labId: testLabId,
              labRole: { permissionLevel: { gte: 0 } }
            }
          }
        }
      });

      if (!nonMemberUser) {
        console.log('No non-member user found, skipping non-pending test');
        return;
      }

      const admission = await prisma.labAdmission.create({
        data: {
          labId: testLabId,
          userId: nonMemberUser.id,
          roleId: testRoleId,
          status: AdmissionStatus.REJECTED
        }
      });

      testAdmissionId = admission.id;

      const response = await request(app)
        .put(`/api/labAdmission/reject/${admission.id}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Cannot reject admission request with status');
    });
  });
});