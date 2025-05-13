import { Request, Response } from 'express';
import { prisma } from '../../';
import { Contact } from '@prisma/client';


/**
 * @swagger
 * /profile/add:
 *   post:
 *     summary: Create a new contact.
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       201:
 *         description: Contact created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       500:
 *         description: Failed to create contact.
 */
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

/**
 * @swagger
 *  /profile/get:
 *   get:
 *     summary: Retrieve all contacts.
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: A list of contacts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       500:
 *         description: Failed to retrieve contacts.
 */
export const getContacts = async (_: Request, res: Response): Promise<void> => {
  try {
    const contacts = await prisma.contact.findMany()
    res.json(contacts)

  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve contacts' })
  }
}

/**
 * @swagger
 * /profile/get/{id}:
 *   get:
 *     summary: Retrieve contacts by user ID.
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID.
 *     responses:
 *       200:
 *         description: A list of contacts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       404:
 *         description: No contacts found.
 *       500:
 *         description: Failed to retrieve contacts.
 */
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

/**
 * @swagger
 * /profile/delete/{id}:
 *   delete:
 *     summary: Delete a contact.
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The contact ID.
 *     responses:
 *       200:
 *         description: Contact deleted.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       500:
 *         description: Failed to delete contact.
 */
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

/**
 * @swagger
 * /profile/edit/{id}:
 *   put:
 *     summary: Update a contact.
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The contact ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       200:
 *         description: Contact updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Invalid contact ID.
 *       500:
 *         description: Failed to update contact.
 */
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