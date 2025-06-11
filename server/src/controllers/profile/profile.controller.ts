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
    const { userId, labId, memberId, type, name, useCase, info } = req.body;

    const contact: Contact = await prisma.contact.create({
      data: {
        userId,
        labId: labId ?? null,
        memberId: memberId ?? null,
        type,
        name,
        useCase,
        info
      }
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
};


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
 * /profile/get/{labID}/{id}:
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
export const getContactsByLabMemberId = async (req: Request, res: Response): Promise<void> => {
  try {
    const labId = parseInt(req.params.lab)
    const userId = parseInt(req.params.user)

    const contacts = await prisma.contact.findMany({
      where: { userId, labId },
      include: {
        user: {
          include: {
            contacts: true,
          },
        },
      },
    })

    if (!contacts) {
      res.status(404).json({ error: 'Contacts not found' })
      return
    }

    res.json(contacts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to retrieve contacts for lab member' })
  }
}

/**
 * @swagger
 * /profile/contacts/user/{userId}:
 *   get:
 *     summary: Retrieve all contacts by user ID (without lab restriction)
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A list of contacts for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   type:
 *                     type: string
 *                   info:
 *                     type: string
 *                   useCase:
 *                     type: string
 *                     nullable: true
 *                   name:
 *                     type: string
 *       404:
 *         description: User not found
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Failed to retrieve contacts
 */
export const getAllContactsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);

    // Validate input parameter
    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get all contacts for the user
    const contacts = await prisma.contact.findMany({
      where: { 
        userId: userId 
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    res.status(200).json(contacts);

  } catch (error) {
    console.error('Error retrieving contacts:', error);
    res.status(500).json({ error: 'Failed to retrieve contacts' });
  }
};


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