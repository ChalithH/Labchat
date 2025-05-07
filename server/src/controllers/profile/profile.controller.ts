import { Request, Response } from 'express';
import { prisma } from '../../';
import { Contact } from '@prisma/client';

export const addContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact_data = req.body;
    const { userId, type, name, useCase, info } = contact_data;

    const contact: Contact = await prisma.contact.create({
      data: {
        userId, type, name, useCase, info
      }
    })

    res.status(201).json(contact)
    return

  } catch (error) {
    console.log(error)

    res.status(500).json({ error: 'Failed to create contact' })
    return
  }
}

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

export const deleteContactById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id)

    const deleted = await prisma.contact.delete({
      where: { id },
    })

    res.status(200).json({ message: 'Contact deleted', contact: deleted })

  } catch (error) {
    console.error(error);

    res.status(500).json({ error: 'Failed to delete contact' })
  }
}

export const editContactById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id)
    const contact_data = req.body

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid contact ID" })
      return
    }
    
    const contact = await prisma.contact.update({
      where: { id },
      data: { ...contact_data },
    })
    res.json(contact)

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to update contact' })
  }
}