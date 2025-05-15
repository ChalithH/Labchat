import { Request, Response } from 'express'
import { notifyUser } from '../../socket'
import { io } from '../..';


export const sendNotifcation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const now = new Date()
    const formattedTime = now.toLocaleString()

    notifyUser(io, id, {
      message: 'You have a new message!',
      timestamp: formattedTime
    })
    res.sendStatus(200)
    return

  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve contacts' })
    return
  }
}