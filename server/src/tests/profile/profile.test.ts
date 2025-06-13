import { prisma } from '../../prisma';
import request from 'supertest';
import app from '../../app';

describe('Profile Controllers', () => {
  // Test data IDs that should exist in production seed data
  let testUserId: number;
  let testLabId: number;
  let testMemberId: number;
  let testContactId: number;

  beforeAll(async () => {
    // Get test data from seeded production data
    const user = await prisma.user.findFirst();
    const lab = await prisma.lab.findFirst();
    const member = await prisma.labMember.findFirst();
    const contact = await prisma.contact.findFirst();

    if (!user || !lab) {
      throw new Error('Required seed data not found');
    }

    testUserId = user.id;
    testLabId = lab.id;
    testMemberId = member?.id || 1;
  });

  afterEach(async () => {
    // Clean up any test contacts created during tests
    if (testContactId) {
      try {
        await prisma.contact.delete({ where: { id: testContactId } });
      } catch (error) {
        // Contact might not exist or already deleted
      }
      testContactId = 0;
    }
  });

  describe('Contact CRUD Operations', () => {
    test('should create a new contact', async () => {
      const contactData = {
        userId: testUserId,
        labId: testLabId,
        memberId: testMemberId,
        type: 'email',
        name: 'Test Email',
        useCase: 'work',
        info: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/profile/add')
        .send(contactData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.type).toBe('email');
      expect(response.body.name).toBe('Test Email');
      expect(response.body.info).toBe('test@example.com');
      expect(response.body.useCase).toBe('work');

      // Store for cleanup
      testContactId = response.body.id;
    });

    test('should create contact with optional fields as null', async () => {
      const contactData = {
        userId: testUserId,
        type: 'phone',
        name: 'Test Phone',
        useCase: 'personal',
        info: '+1234567890'
        // labId and memberId not provided
      };

      const response = await request(app)
        .post('/api/profile/add')
        .send(contactData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.labId).toBeNull();
      expect(response.body.memberId).toBeNull();
      expect(response.body.type).toBe('phone');
      expect(response.body.info).toBe('+1234567890');

      // Store for cleanup
      testContactId = response.body.id;
    });

    test('should get all contacts', async () => {
      const response = await request(app)
        .get('/api/profile/get')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('userId');
        expect(response.body[0]).toHaveProperty('type');
        expect(response.body[0]).toHaveProperty('info');
        expect(response.body[0]).toHaveProperty('name');
      }
    });

    test('should get contacts by user ID', async () => {
      const response = await request(app)
        .get(`/api/profile/contacts/user/${testUserId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('userId', testUserId);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('type');
        expect(response.body[0]).toHaveProperty('info');
        expect(response.body[0]).toHaveProperty('name');
      }
    });

    test('should return 404 for non-existent user ID', async () => {
      const response = await request(app)
        .get('/api/profile/contacts/user/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });

    test('should return 400 for invalid user ID format', async () => {
      const response = await request(app)
        .get('/api/profile/contacts/user/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid user ID');
    });

    test('should return 400 for negative user ID', async () => {
      const response = await request(app)
        .get('/api/profile/contacts/user/-1')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid user ID');
    });

    test('should update contact by ID', async () => {
      // First create a contact
      const contact = await prisma.contact.create({
        data: {
          userId: testUserId,
          type: 'email',
          name: 'Original Email',
          info: 'original@example.com',
          useCase: 'work'
        }
      });

      testContactId = contact.id;

      const updateData = {
        name: 'Updated Email',
        info: 'updated@example.com',
        useCase: 'personal'
      };

      const response = await request(app)
        .put(`/api/profile/edit/${contact.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(contact.id);
      expect(response.body.name).toBe('Updated Email');
      expect(response.body.info).toBe('updated@example.com');
      expect(response.body.useCase).toBe('personal');
      expect(response.body.userId).toBe(testUserId);
    });

    test('should return 400 for invalid contact ID in update', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/profile/edit/invalid')
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid contact ID');
    });

    test('should delete contact by ID', async () => {
      // First create a contact
      const contact = await prisma.contact.create({
        data: {
          userId: testUserId,
          type: 'email',
          name: 'To Delete',
          info: 'delete@example.com',
          useCase: 'test'
        }
      });

      const response = await request(app)
        .delete(`/api/profile/delete/${contact.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Contact deleted');
      expect(response.body).toHaveProperty('contact');
      expect(response.body.contact.id).toBe(contact.id);

      // Verify contact was deleted
      const deletedContact = await prisma.contact.findUnique({
        where: { id: contact.id }
      });
      expect(deletedContact).toBeNull();
    });

    test('should handle error when deleting non-existent contact', async () => {
      const response = await request(app)
        .delete('/api/profile/delete/99999')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to delete contact');
    });
  });

  describe('Contact Retrieval by Lab and Member', () => {
    test('should get contacts by lab member ID', async () => {
      // This endpoint has some parameter issues in the original code
      // Testing the current implementation despite the path parameter mismatch
      const response = await request(app)
        .get(`/api/profile/get/${testLabId}/${testUserId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // The response might be empty, which is valid
    });

    test('should handle invalid parameters in lab member contact retrieval', async () => {
      const response = await request(app)
        .get('/api/profile/get/invalid/invalid')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to retrieve contacts for lab member');
    });
  });

  describe('Data Validation and Edge Cases', () => {
    test('should handle missing required fields in contact creation', async () => {
      const incompleteData = {
        userId: testUserId,
        type: 'email'
        // Missing name and info
      };

      const response = await request(app)
        .post('/api/profile/add')
        .send(incompleteData)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to create contact');
    });

    test('should handle contact creation with all possible contact types', async () => {
      const contactTypes = [
        { type: 'email', info: 'test@example.com', name: 'Email Contact' },
        { type: 'phone', info: '+1234567890', name: 'Phone Contact' },
        { type: 'slack', info: '@testuser', name: 'Slack Contact' },
        { type: 'discord', info: 'testuser#1234', name: 'Discord Contact' }
      ];

      const createdContacts = [];

      for (const contactType of contactTypes) {
        const contactData = {
          userId: testUserId,
          ...contactType,
          useCase: 'test'
        };

        const response = await request(app)
          .post('/api/profile/add')
          .send(contactData)
          .expect(201);

        expect(response.body.type).toBe(contactType.type);
        expect(response.body.info).toBe(contactType.info);
        expect(response.body.name).toBe(contactType.name);

        createdContacts.push(response.body.id);
      }

      // Clean up created contacts
      for (const contactId of createdContacts) {
        await prisma.contact.delete({ where: { id: contactId } });
      }
    });

    test('should handle partial updates correctly', async () => {
      // Create a contact with all fields
      const contact = await prisma.contact.create({
        data: {
          userId: testUserId,
          labId: testLabId,
          type: 'email',
          name: 'Full Contact',
          info: 'full@example.com',
          useCase: 'work'
        }
      });

      testContactId = contact.id;

      // Update only one field
      const partialUpdate = {
        name: 'Partially Updated Contact'
      };

      const response = await request(app)
        .put(`/api/profile/edit/${contact.id}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.id).toBe(contact.id);
      expect(response.body.name).toBe('Partially Updated Contact');
      expect(response.body.info).toBe('full@example.com'); // Should remain unchanged
      expect(response.body.useCase).toBe('work'); // Should remain unchanged
      expect(response.body.type).toBe('email'); // Should remain unchanged
    });

    test('should return empty array for user with no contacts', async () => {
      // Find a user with no contacts or create one
      const userWithNoContacts = await prisma.user.findFirst({
        where: {
          contacts: {
            none: {}
          }
        }
      });

      if (userWithNoContacts) {
        const response = await request(app)
          .get(`/api/profile/contacts/user/${userWithNoContacts.id}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(0);
      }
    });
  });

  describe('Contact Ordering and Sorting', () => {
    test('should return contacts ordered by name', async () => {
      // Create multiple contacts with different names
      const contactsToCreate = [
        { name: 'Zebra Contact', info: 'zebra@example.com' },
        { name: 'Alpha Contact', info: 'alpha@example.com' },
        { name: 'Beta Contact', info: 'beta@example.com' }
      ];

      const createdContacts: number[] = [];

      for (const contactData of contactsToCreate) {
        const contact = await prisma.contact.create({
          data: {
            userId: testUserId,
            type: 'email',
            ...contactData,
            useCase: 'test'
          }
        });
        createdContacts.push(contact.id);
      }

      const response = await request(app)
        .get(`/api/profile/contacts/user/${testUserId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      // Find our test contacts in the response
      const testContacts = response.body.filter((contact: { id: number; }) => 
        createdContacts.includes(contact.id)
      );

      if (testContacts.length >= 2) {
        // Check if they're ordered by name (ascending)
        for (let i = 0; i < testContacts.length - 1; i++) {
          expect(testContacts[i].name.localeCompare(testContacts[i + 1].name)).toBeLessThanOrEqual(0);
        }
      }

      // Clean up created contacts
      for (const contactId of createdContacts) {
        await prisma.contact.delete({ where: { id: contactId } });
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully in contact creation', async () => {
      // Try to create contact with invalid userId (assuming foreign key constraint)
      const invalidContactData = {
        userId: 99999, // Non-existent user
        type: 'email',
        name: 'Invalid Contact',
        info: 'invalid@example.com',
        useCase: 'test'
      };

      const response = await request(app)
        .post('/api/profile/add')
        .send(invalidContactData)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to create contact');
    });

    test('should handle database errors gracefully in contact update', async () => {
      // Try to update non-existent contact
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/profile/edit/99999')
        .send(updateData)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to update contact');
    });

    test('should handle malformed request body in contact creation', async () => {
      const response = await request(app)
        .post('/api/profile/add')
        .send('invalid json string')
        .expect(400); // Expect 400 for malformed JSON, but implementation might return 500

      // The actual status code depends on Express middleware configuration
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('Contact Information Validation', () => {
    test('should accept various email formats', async () => {
      const emailFormats = [
        'simple@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user123@sub.example.com'
      ];

      const createdContacts = [];

      for (const email of emailFormats) {
        const contactData = {
          userId: testUserId,
          type: 'email',
          name: `Email ${email}`,
          info: email,
          useCase: 'test'
        };

        const response = await request(app)
          .post('/api/profile/add')
          .send(contactData)
          .expect(201);

        expect(response.body.info).toBe(email);
        createdContacts.push(response.body.id);
      }

      // Clean up
      for (const contactId of createdContacts) {
        await prisma.contact.delete({ where: { id: contactId } });
      }
    });

    test('should accept various phone number formats', async () => {
      const phoneFormats = [
        '+1234567890',
        '(123) 456-7890',
        '123-456-7890',
        '123.456.7890'
      ];

      const createdContacts = [];

      for (const phone of phoneFormats) {
        const contactData = {
          userId: testUserId,
          type: 'phone',
          name: `Phone ${phone}`,
          info: phone,
          useCase: 'test'
        };

        const response = await request(app)
          .post('/api/profile/add')
          .send(contactData)
          .expect(201);

        expect(response.body.info).toBe(phone);
        createdContacts.push(response.body.id);
      }

      // Clean up
      for (const contactId of createdContacts) {
        await prisma.contact.delete({ where: { id: contactId } });
      }
    });
  });
});