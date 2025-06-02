import { Request, Response } from 'express'
import { notifyUser } from '../../socket'
import { io, prisma } from '../..';


export const sendNotifcation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { message } = req.body

    const notification = await prisma.notification.create({
      data: {
        userId: parseInt(id),
        message
      }
    })

    notifyUser(io, id, {
      id: notification.id,
      message: notification.message,
      timestamp: notification.timestamp,
      read: notification.read
    })

    res.status(200).send(notification)
    return

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to retrieve notifications' })
    return
  }
}

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const notifications = await prisma.notification.findMany({
      where: { userId: parseInt(id) },
      orderBy: { timestamp: 'desc' }
    })

    res.status(200).json(notifications)
    return

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch notifications' })
    return

  }
}

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true }
    })

    res.status(200).json(updated)
    return

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to mark notification as read' })
    return

  }
}

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    await prisma.notification.delete({
      where: { id: parseInt(id) }
    })

    res.sendStatus(200)
    return

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to delete notification' })
    return
  }
}

export const deleteAllNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    await prisma.notification.deleteMany({
      where: { userId: parseInt(userId) }
    })

    res.sendStatus(200)
    return

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to delete notifications' })
    return
  }
}