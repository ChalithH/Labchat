import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /admin/get-all-instruments:
 *   get:
 *     summary: Get all instruments
 *     description: Retrieves a list of all instruments in the system
 *     tags: [Admin, Instruments]
 *     responses:
 *       200:
 *         description: List of instruments fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                     nullable: true
 *       500:
 *         description: Internal server error
 */
export const getAllInstruments = async (req: Request, res: Response): Promise<void> => {
    try {
        const instruments = await prisma.instrument.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        res.status(200).json(instruments);
    } catch (error) {
        console.error('Error fetching instruments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/create-instrument:
 *   post:
 *     summary: Create a new instrument
 *     description: Adds a new instrument to the system
 *     tags: [Admin, Instruments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the instrument
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Description of the instrument
 *     responses:
 *       201:
 *         description: Instrument created successfully
 *       400:
 *         description: Bad request (missing required fields or duplicate name)
 *       500:
 *         description: Internal server error
 */
export const createInstrument = async (req: Request, res: Response): Promise<void> => {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Instrument name is required and must be a non-empty string' });
        return;
    }

    try {

        // Check if instrument with this name already exists
        const existingInstrument = await prisma.instrument.findFirst({
            where: { 
                name: {
                    equals: name.trim(),
                    mode: 'insensitive'
                }
            }
        });

        if (existingInstrument) {
            res.status(400).json({ error: 'An instrument with this name already exists' });
            return;
        }

        const newInstrument = await prisma.instrument.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null
            }
        });

        res.status(201).json(newInstrument);
    } catch (error) {
        console.error('Error creating instrument:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                res.status(400).json({ error: 'An instrument with this name already exists' });
                return;
            }
        }
        res.status(500).json({ error: 'Internal server error while creating instrument' });
    }
};