import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /calendar/getEventTypes:
 *   get:
 *     summary: Get all event types
 *     tags: [Calendar]
 *     responses:
 *       200:
 *         description: A list of all event types
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
 *                     description: Name of the event type
 *                   color:
 *                     type: string
 *                     description: Hex color code for the event type
 *                     example: "#3B82F6"
 *                 example:
 *                   id: 1
 *                   name: "Meeting"
 *                   color: "#3B82F6"
 *       500:
 *         description: Failed to retrieve event types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             example:
 *               error: "Failed to retrieve event types"
 */
export const getEventTypes = async (req: Request, res: Response): Promise<void> => {
    try {
        const eventTypes = await prisma.eventType.findMany({
            select: {
                id: true,
                name: true,
                color: true, // Now includes the hex color code
            }
        });
        res.json(eventTypes);
    } catch (error) {
        console.error('Error retrieving event types:', error);
        res.status(500).json({ error: 'Failed to retrieve event types' });
    }
};

/**
 * @swagger
 * /calendar/get-instruments:
 *   get:
 *     summary: Get all instruments
 *     tags: [Calendar]
 *     responses:
 *       200:
 *         description: A list of all instruments
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
 *                     description: Name of the instrument
 *                 example:
 *                   id: 1
 *                   name: "Microscope"
 */
export const getInstruments = async (req: Request, res: Response): Promise<void> => {
    try {
        const instruments = await prisma.instrument.findMany({
            select: {
                id: true,
                name: true,
            }
        });
        res.json(instruments);
    } catch (error) {
        console.error('Error retrieving instruments:', error);
        res.status(500).json({ error: 'Failed to retrieve instruments' });
    }
};