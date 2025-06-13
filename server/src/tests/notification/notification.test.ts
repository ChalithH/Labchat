import request from 'supertest'
import app from '../../app'
import { prisma } from '../..'

describe('Notification API Integration Tests', () => {
  let userId: number
  let notificationId: number

  beforeAll(async () => {
    // Create a test user
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
    userId = user.id
  })

  beforeEach(async () => {
    // Clean notifications for this user before each test
    await prisma.notification.deleteMany({ where: { userId } })
  })

  afterAll(async () => {
    // Clean notifications and user after tests
    await prisma.notification.deleteMany({ where: { userId } })
    await prisma.user.delete({ where: { id: userId } })
    await prisma.$disconnect()
  })

  test('POST /:id - send notification', async () => {
    const res = await request(app)
      .post(`/api/notification/${userId}`)
      .send({ message: 'Test notification' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body.message).toBe('Test notification')

    notificationId = res.body.id
  })

  test('GET /:id - get user notifications', async () => {
    // Insert a notification to fetch
    await prisma.notification.create({
      data: { userId, message: 'Get test' }
    })

    const res = await request(app).get(`/api/notification/${userId}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  test('PUT /read/:id - mark notification read', async () => {
    // Create notification to mark as read
    const notif = await prisma.notification.create({
      data: { userId, message: 'Mark read test' }
    })

    const res = await request(app).put(`/api/notification/read/${notif.id}`)

    expect(res.status).toBe(200)
    expect(res.body.read).toBe(true)
  })

  test('DELETE /:id - delete notification', async () => {
    // Create notification to delete
    const notif = await prisma.notification.create({
      data: { userId, message: 'Delete test' }
    })

    const res = await request(app).delete(`/api/notification/${notif.id}`)

    expect(res.status).toBe(200)

    // Confirm deletion in DB
    const deleted = await prisma.notification.findUnique({
      where: { id: notif.id }
    })
    expect(deleted).toBeNull()
  })

  test('DELETE /clear-all/:userId - delete all notifications', async () => {
    // Create multiple notifications to clear
    await prisma.notification.createMany({
      data: [
        { userId, message: 'Clear test 1' },
        { userId, message: 'Clear test 2' }
      ]
    })

    const res = await request(app).delete(`/api/notification/clear-all/${userId}`)

    expect(res.status).toBe(200)

    const remaining = await prisma.notification.findMany({
      where: { userId }
    })
    expect(remaining.length).toBe(0)
  })
})
