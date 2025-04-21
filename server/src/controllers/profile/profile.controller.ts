import { Request, Response } from 'express';
import { prisma } from '../../';


export const getContacts = async (_: Request, res: Response): Promise<void> => {
  try {
    const contacts = await prisma.contact.findMany()
    res.json(contacts)

  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve contacts' })
  }
}

export const getContactsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id)
    const contacts = await prisma.contact.findMany({
      where: { userId },
    })
    
    if (!contacts) {
      res.status(404).json({ error: 'Contacts not found' })
      return
    }
    
    res.json(contacts)

  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve contacts' })
  }
}