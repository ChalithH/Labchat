// controllers/calendar/status.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { isValidStatusChange } from '../../services/eventStatusService';
import { transformEvents, EVENT_INCLUDE } from './helpers';

const prisma = new PrismaClient();

/**
 * @swagger
 * /calendar/change-status:
 *   put:
 *     summary: Change the status of an event
 *     tags: [Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - statusName
 *             properties:
 *               eventId:
 *                 type: integer
 *                 description: ID of the event to update
 *               statusName:
 *                 type: string
 *                 enum: [booked, scheduled, cancelled, completed, elapsed]
 *                 description: New status name
 *     responses:
 *       200:
 *         description: Status changed successfully
 *       400:
 *         description: Invalid status change or missing fields
 *       404:
 *         description: Event or status not found
 *       500:
 *         description: Failed to change status
 */
export const changeEventStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { eventId, statusName } = req.body;

        if (!eventId || !statusName) {
            res.status(400).json({ error: 'Event ID and status name are required' });
            return;
        }

        // Get the event with its current type and status
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                type: true,
                status: true
            }
        });

        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        // Check if the status change is valid for this event type
        if (!isValidStatusChange(event.type!.name, statusName)) {
            res.status(400).json({ 
                error: `Cannot change ${event.type!.name} event to ${statusName} status` 
            });
            return;
        }

        // Get the new status
        const newStatus = await prisma.eventStatus.findUnique({
            where: { name: statusName }
        });

        if (!newStatus) {
            res.status(404).json({ error: 'Status not found' });
            return;
        }

        // Update the event status
        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: { statusId: newStatus.id },
            include: EVENT_INCLUDE
        });

        const transformedEvent = transformEvents([updatedEvent])[0];
        res.status(200).json(transformedEvent);

    } catch (error) {
        console.error('Error changing event status:', error);
        res.status(500).json({ error: 'Failed to change event status' });
    }
};

/**
 * @swagger
 * /calendar/get-statuses:
 *   get:
 *     summary: Get all available event statuses
 *     tags: [Calendar]
 *     responses:
 *       200:
 *         description: List of all event statuses
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
 *                   color:
 *                     type: string
 *       500:
 *         description: Failed to retrieve statuses
 */
export const getEventStatuses = async (req: Request, res: Response): Promise<void> => {
    try {
        const statuses = await prisma.eventStatus.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                color: true
            }
        });

        res.status(200).json(statuses);
    } catch (error) {
        console.error('Error retrieving event statuses:', error);
        res.status(500).json({ error: 'Failed to retrieve event statuses' });
    }
};