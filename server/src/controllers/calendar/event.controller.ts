import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { isValidLabId, validateStartEndDates, transformEvents, EVENT_INCLUDE } from './helpers';

const prisma = new PrismaClient();

/**
 * @swagger
 * /calendar/events/{labId}:
 *   get:
 *     summary: Get all events for a lab
 *     tags: [Calendar]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Positive integer Id of the lab to retrieve events from
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start boundary (inclusive) for events (ISO 8601 UTC date-time string; if missing timezone, UTC is assumed) 
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End boundary (inclusive) for events (ISO 8601 UTC date-time string; if missing timezone, UTC is assumed) 
 *     responses:
 *       200:
 *         description: A list of all events for the specified lab
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       400:
 *         description: labId is missing or invalid (must be a positive integer)
 *       500:
 *         description: Failed to retrieve events
 */
export const getLabEvents = async (req: Request, res: Response): Promise<void> => {
    const { labId } = req.params;
    const { start, end } = req.query;
    
    if (!labId) {
        res.status(400).json({ error: 'labId cannot be empty' });
        return;
    }
    
    if (!isValidLabId(labId)) {
        res.status(400).json({ error: 'labId must be a positive integer' });
        return;
    }

    const { errors, startDate, endDate } = validateStartEndDates(start, end);

    if (errors.length > 0) {
        res.status(400).json({ error: errors });
        return;
    }

    try {
        // Event overlaps start/end if event start date is <= end and event end date >= start   
        const events = await prisma.event.findMany({
            where: {
                labId: Number(labId),
                startTime: { lte: endDate },
                endTime: { gte: startDate },
            },
            include: EVENT_INCLUDE
        });
        
        // Use the global transformation function
        const transformedEvents = transformEvents(events);
        
        res.json(transformedEvents);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve events' });
    }
};

/**
 * @swagger
 * /calendar/member-events/{labId}/{memberId}:
 *   get:
 *     summary: Get all events within a lab where the member is assigned
 *     tags: [Calendar]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Positive integer Id of the lab to retrieve events from
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Positive integer Id of the lab member assigned to the events
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start boundary (inclusive) for events (ISO 8601 UTC date-time string; if missing timezone, UTC is assumed) 
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End boundary (inclusive) for events (ISO 8601 UTC date-time string; if missing timezone, UTC is assumed) 
 *     responses:
 *       200:
 *         description: A list of events where the lab member is assigned
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       400:
 *         description: labId/memberId is missing or invalid (must be positive integers)
 *       500:
 *         description: Failed to retrieve events
 */
export const getMemberEvents = async (req: Request, res: Response): Promise<void> => {
    const { labId, memberId } = req.params;
    const { start, end } = req.query;

    if (!labId || !memberId) {
        res.status(400).json({ error: 'Both labId and memberId are required' });
        return;
    }
    
    if (!isValidLabId(labId)) { 
        res.status(400).json({ error: 'labId must be a positive integer' });
        return;
    }
    
    if (!isValidLabId(memberId)) { 
        res.status(400).json({ error: 'memberId must be a positive integer' });
        return;
    }

    const { errors, startDate, endDate } = validateStartEndDates(start, end);

    if (errors.length > 0) {
        res.status(400).json({ error: errors });
        return;
    }

    try {
        const labIdNum = Number(labId);
        const memberIdNum = Number(memberId);

        // Get events where the member is assigned (in eventAssignments)
        const events = await prisma.event.findMany({
            where: {
                labId: labIdNum,
                startTime: { lte: endDate },
                endTime: { gte: startDate },
                eventAssignments: {
                    some: {
                        memberId: memberIdNum,
                    },
                },
            },
            include: EVENT_INCLUDE
        });
        
        // Use the imported transformation function
        const transformedEvents = transformEvents(events);
        
        res.json(transformedEvents);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve events' });
    }
};

/**
 * @swagger
 * /calendar/event/{eventId}:
 *   get:
 *     summary: Get a single event by ID
 *     tags: [Calendar]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID of the event to retrieve
 *     responses:
 *       200:
 *         description: Single event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Event not found
 *       400:
 *         description: Invalid event ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid event ID
 *       500:
 *         description: Failed to retrieve event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to retrieve event
 */
export const getSingleEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { eventId } = req.params;
        
        // Validate event ID
        const eventIdNum = parseInt(eventId, 10);
        if (isNaN(eventIdNum) || eventIdNum <= 0) {
            res.status(400).json({ error: 'Invalid event ID' });
            return;
        }

        // Fetch the event with all related data
        const event = await prisma.event.findUnique({
            where: { id: eventIdNum },
            include: EVENT_INCLUDE
        });

        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        // Transform the event using the existing helper function
        const transformedEvent = transformEvents([event])[0];

        res.status(200).json(transformedEvent);
    } catch (error) {
        console.error('Error retrieving single event:', error);
        res.status(500).json({ error: 'Failed to retrieve event' });
    }
};