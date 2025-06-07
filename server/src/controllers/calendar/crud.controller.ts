import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { EventRequestBody, UpdateEventRequestBody } from './types';
import { transformEvents, EVENT_INCLUDE } from './helpers';

const prisma = new PrismaClient();

/**
 * @swagger
 * /calendar/create-event:
 *   post:
 *     summary: Create a new event
 *     description: Creates a new event in the system with optional assigned members and instrument booking
 *     
 *     tags: [Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - labId
 *               - memberId
 *               - title
 *               - startTime
 *               - endTime
 *             properties:
 *               labId:
 *                 type: integer
 *                 description: ID of the lab where the event takes place
 *               memberId:
 *                 type: integer
 *                 description: ID of the lab member creating the event
 *               instrumentId:
 *                 type: integer
 *                 nullable: true
 *                 description: Optional ID of the instrument being booked
 *               title:
 *                 type: string
 *                 description: Title of the event
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Optional detailed description of the event
 *               statusId:
 *                 type: integer
 *                 nullable: true
 *                 description: Status ID of the event (will use default if not provided)
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Start time of the event (ISO format)
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: End time of the event (ISO format)
 *               typeId:
 *                 type: integer
 *                 description: ID of the event type
 *               assignedMembers:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of lab member IDs who are assigned to this event
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Bad request - missing required fields or invalid data
 *       500:
 *         description: Server error
 */
export const createEvent = async (req: Request<{}, {}, EventRequestBody>, res: Response): Promise<void> => {
    try {        
        const {
            labId,
            memberId,
            instrumentId,
            title,
            description,
            statusId,
            startTime,
            endTime,
            typeId,
            assignedMembers = []
        } = req.body;
        
        // Basic validation
        if (!labId || !memberId || !title || !startTime || !endTime) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Parse dates if they're strings
        const parsedStartTime = typeof startTime === 'string' ? new Date(startTime) : startTime;
        const parsedEndTime = typeof endTime === 'string' ? new Date(endTime) : endTime;

        // Validate date range
        if (parsedEndTime <= parsedStartTime) {
            res.status(400).json({ error: 'End time must be after start time' });
            return;
        }

        // Get event type to determine default status
        const eventType = await prisma.eventType.findUnique({
            where: { id: typeId }
        });

        if (!eventType) {
            res.status(400).json({ error: 'Invalid event type' });
            return;
        }

        // Determine the status ID to use
        let finalStatusId = statusId;
        if (!finalStatusId) {
            // Get default status based on event type
            const { getDefaultStatusForEventType } = await import('../../services/eventStatusService');
            finalStatusId = await getDefaultStatusForEventType(eventType.name);
        }

        // Create the event with a transaction to ensure event and assignments are created together
        const event = await prisma.$transaction(async (tx) => {
            // Create the event
            const newEvent = await tx.event.create({
                data: {
                    labId,
                    memberId,
                    instrumentId: instrumentId || null,
                    title,
                    description,
                    statusId: finalStatusId,
                    startTime: parsedStartTime,
                    endTime: parsedEndTime,
                    typeId: typeId,
                }
            });

            // Create event assignments if any members are assigned
            if (assignedMembers.length > 0) {
                await tx.eventAssignment.createMany({
                    data: assignedMembers.map((memberId: any) => ({
                        eventId: newEvent.id,
                        memberId
                    }))
                });
            }

            // Return the created event with assignments
            return tx.event.findUnique({
                where: { id: newEvent.id },
                include: EVENT_INCLUDE
            });
        });

        if (!event) {
            res.status(500).json({ error: 'Failed to create event' });
            return;
        }

        const transformedEvent = transformEvents([event])[0];
        res.status(201).json(transformedEvent);
    } catch (error) {
        console.error('Event creation error:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};

/**
 * @swagger
 * /calendar/update-event:
 *   put:
 *     summary: Updates an existing event
 *     tags: [Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the event to update
 *               labId:
 *                 type: integer
 *                 description: ID of the lab where the event is scheduled
 *               memberId:
 *                 type: integer
 *                 description: ID of the lab member associated with the event (assigner)
 *               instrumentId:
 *                 type: integer
 *                 nullable: true
 *                 description: ID of the instrument (required for equipment events)
 *               title:
 *                 type: string
 *                 description: Title of the event
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Optional description of the event
 *               statusId:
 *                 type: integer
 *                 description: Status ID of the event
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Start time of the event
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: End time of the event
 *               typeId:
 *                 type: integer
 *                 description: ID of the event type
 *               assignedMembers:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of LabMember IDs assigned to the event
 *     responses:
 *       200:
 *         description: Event successfully updated
 *       400:
 *         description: Validation error or invalid input
 *       404:
 *         description: Event not found
 *       500:
 *         description: Failed to update event
 */
export const updateEvent = async (req: Request<{ id: string }, {}, UpdateEventRequestBody>, res: Response): Promise<void> => {
    try {
        console.log('Update event request body:\n', req.body);
        const eventId = parseInt(req.body.id, 10);
        console.log('Event ID:', eventId);
        
        if (isNaN(eventId)) {
            res.status(400).json({ error: 'Invalid event ID' });
            return;
        }

        const {
            labId,
            memberId, 
            instrumentId,
            title,
            description,
            statusId,
            startTime,
            endTime,
            typeId,
            assignedMembers
        } = req.body;

        const existingEvent = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                eventAssignments: true,
                type: true,
                status: true
            },
        });

        if (!existingEvent) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        // Validate status change if provided
        if (statusId !== undefined) {
            const newStatus = await prisma.eventStatus.findUnique({
                where: { id: statusId }
            });

            if (!newStatus) {
                res.status(400).json({ error: 'Invalid status ID' });
                return;
            }

            const { isValidStatusChange } = await import('../../services/eventStatusService');
            if (!isValidStatusChange(existingEvent.type!.name, newStatus.name)) {
                res.status(400).json({ 
                    error: `Cannot change ${existingEvent.type!.name} event to ${newStatus.name} status` 
                });
                return;
            }
        }

        const updateData: any = {};
        if (labId !== undefined) updateData.labId = labId;
        if (memberId !== undefined) updateData.memberId = memberId;
        if (instrumentId !== undefined) updateData.instrumentId = instrumentId;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (statusId !== undefined) updateData.statusId = statusId;
        if (startTime !== undefined) updateData.startTime = typeof startTime === 'string' ? new Date(startTime) : startTime;
        if (endTime !== undefined) updateData.endTime = typeof endTime === 'string' ? new Date(endTime) : endTime;
        if (typeId !== undefined) updateData.typeId = typeId;

        if (updateData.startTime !== undefined || updateData.endTime !== undefined) {
            const finalStartTime = updateData.startTime || existingEvent.startTime;
            const finalEndTime = updateData.endTime || existingEvent.endTime;
            if (new Date(finalEndTime) <= new Date(finalStartTime)) {
                res.status(400).json({ error: 'End time must be after start time' });
                return;
            }
        }

        const updatedEvent = await prisma.$transaction(async (tx) => {
            const event = await tx.event.update({
                where: { id: eventId },
                data: updateData,
            });

            if (assignedMembers !== undefined) {
                // Delete existing assignments for this event
                await tx.eventAssignment.deleteMany({
                    where: { eventId: event.id },
                });

                // Create new assignments based on the provided list
                if (assignedMembers.length > 0) {
                    const validMembers = await tx.labMember.findMany({
                        where: {
                            id: { in: assignedMembers }
                        },
                        select: { id: true }
                    });
                    const validMemberIds = validMembers.map(m => m.id);
                    const assignmentsToCreate = assignedMembers
                        .filter(memberId => validMemberIds.includes(memberId))
                        .map(memberId => ({
                            eventId: event.id,
                            memberId
                        }));

                    if (assignmentsToCreate.length > 0) {
                        await tx.eventAssignment.createMany({
                            data: assignmentsToCreate,
                            skipDuplicates: true
                        });
                    }
                }
            }

            // Return the updated event with the new assignments included
            return tx.event.findUnique({
                where: { id: event.id },
                include: EVENT_INCLUDE
            });
        });

        if (!updatedEvent) {
            res.status(500).json({ error: 'Failed to update event' });
            return;
        }

        const transformedEvent = transformEvents([updatedEvent])[0];
        res.status(200).json(transformedEvent);
                        
    } catch (error) {
        console.error('Event update error:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
};

/**
 * @swagger
 * /calendar/create-recurring-events:
 *   post:
 *     summary: Create multiple recurring events
 *     description: Creates multiple events in a recurring pattern (daily, weekly, or monthly)
 *     
 *     tags: [Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - labId
 *               - memberId
 *               - title
 *               - startTime
 *               - endTime
 *               - frequency
 *               - repetitions
 *             properties:
 *               labId:
 *                 type: integer
 *                 description: ID of the lab where the events take place
 *               memberId:
 *                 type: integer
 *                 description: ID of the lab member creating the events
 *               instrumentId:
 *                 type: integer
 *                 nullable: true
 *                 description: Optional ID of the instrument being booked
 *               title:
 *                 type: string
 *                 description: Base title for the events
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Optional detailed description for the events
 *               statusId:
 *                 type: integer
 *                 nullable: true
 *                 description: Status ID of the events (will use default if not provided)
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Start time of the first event (ISO format)
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: End time of the first event (ISO format)
 *               typeId:
 *                 type: integer
 *                 description: ID of the event type
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *                 description: How often to repeat the event
 *               repetitions:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 365
 *                 description: Number of events to create
 *               assignedMembers:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of lab member IDs who are assigned to these events
 *     responses:
 *       201:
 *         description: Recurring events created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 eventsCreated:
 *                   type: integer
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       400:
 *         description: Bad request - missing required fields or invalid data
 *       500:
 *         description: Server error
 */
export const createRecurringEvents = async (req: Request, res: Response): Promise<void> => {
    try {        
        const {
            labId,
            memberId,
            instrumentId,
            title,
            description,
            statusId,
            startTime,
            endTime,
            typeId,
            frequency,
            repetitions,
            assignedMembers = []
        } = req.body;
        
        // Basic validation
        if (!labId || !memberId || !title || !startTime || !endTime || !frequency || !repetitions) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Validate frequency
        if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
            res.status(400).json({ error: 'Invalid frequency. Must be daily, weekly, or monthly' });
            return;
        }

        // Validate repetitions
        if (repetitions < 1 || repetitions > 365) {
            res.status(400).json({ error: 'Repetitions must be between 1 and 365' });
            return;
        }

        // Parse dates if they're strings
        const parsedStartTime = typeof startTime === 'string' ? new Date(startTime) : startTime;
        const parsedEndTime = typeof endTime === 'string' ? new Date(endTime) : endTime;

        // Calculate duration for each event
        const duration = parsedEndTime.getTime() - parsedStartTime.getTime();

        // Validate date range
        if (duration <= 0) {
            res.status(400).json({ error: 'End time must be after start time' });
            return;
        }

        // Get event type to determine default status
        const eventType = await prisma.eventType.findUnique({
            where: { id: typeId }
        });

        if (!eventType) {
            res.status(400).json({ error: 'Invalid event type' });
            return;
        }

        // Determine the status ID to use
        let finalStatusId = statusId;
        if (!finalStatusId) {
            // Get default status based on event type
            const { getDefaultStatusForEventType } = await import('../../services/eventStatusService');
            finalStatusId = await getDefaultStatusForEventType(eventType.name);
        }

        // Generate all event dates and times
        const eventsToCreate: { labId: any; memberId: any; instrumentId: any; title: any; description: any; statusId: any; startTime: Date; endTime: Date; typeId: any; }[] = [];
        for (let i = 0; i < repetitions; i++) {
            const eventStartTime = new Date(parsedStartTime);
            const eventEndTime = new Date(parsedStartTime.getTime() + duration);

            // Calculate the date offset based on frequency
            switch (frequency) {
                case 'daily':
                    eventStartTime.setDate(parsedStartTime.getDate() + i);
                    eventEndTime.setDate(parsedStartTime.getDate() + i);
                    break;
                case 'weekly':
                    eventStartTime.setDate(parsedStartTime.getDate() + (i * 7));
                    eventEndTime.setDate(parsedStartTime.getDate() + (i * 7));
                    break;
                case 'monthly':
                    eventStartTime.setMonth(parsedStartTime.getMonth() + i);
                    eventEndTime.setMonth(parsedStartTime.getMonth() + i);
                    // Handle month overflow (e.g., Jan 31 + 1 month = Feb 28/29)
                    if (eventStartTime.getDate() !== parsedStartTime.getDate()) {
                        eventStartTime.setDate(0); // Set to last day of previous month
                        eventEndTime.setDate(0);
                    }
                    break;
            }

            eventsToCreate.push({
                labId,
                memberId,
                instrumentId: instrumentId || null,
                title: repetitions > 1 ? `${title} (${i + 1}/${repetitions})` : title,
                description,
                statusId: finalStatusId,
                startTime: eventStartTime,
                endTime: eventEndTime,
                typeId: typeId,
            });
        }

        // Create all events and their assignments in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const createdEvents = [];

            for (const eventData of eventsToCreate) {
                // Create the event
                const newEvent = await tx.event.create({
                    data: eventData
                });

                // Create event assignments if any members are assigned
                if (assignedMembers.length > 0) {
                    await tx.eventAssignment.createMany({
                        data: assignedMembers.map((memberId: any) => ({
                            eventId: newEvent.id,
                            memberId
                        }))
                    });
                }

                createdEvents.push(newEvent.id);
            }

            // Return all created events with their full data
            return tx.event.findMany({
                where: { id: { in: createdEvents } },
                include: EVENT_INCLUDE,
                orderBy: { startTime: 'asc' }
            });
        });

        if (!result || result.length === 0) {
            res.status(500).json({ error: 'Failed to create recurring events' });
            return;
        }

        const transformedEvents = transformEvents(result);
        
        res.status(201).json({
            message: `Successfully created ${result.length} recurring events`,
            eventsCreated: result.length,
            events: transformedEvents
        });
    } catch (error) {
        console.error('Recurring events creation error:', error);
        res.status(500).json({ error: 'Failed to create recurring events' });
    }
};

/**
 * @swagger
 * /calendar/delete-event:
 *   delete:
 *     summary: Deletes an event by ID
 *     tags: [Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID of the event to delete
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Failed to delete event
 */
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const eventId: number = req.body.id;

        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        // Delete the event
        await prisma.event.delete({
            where: { id: eventId },
        });

        res.status(200).json({ event, message: 'Event deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
};

/**
 * @swagger
 * /calendar/assign-member:
 *   post:
 *     summary: Assigns a lab member to an event
 *     tags: [Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *               - eventId
 *               - labId
 *             properties:
 *               memberId:
 *                 type: integer
 *                 description: ID of the lab member to assign
 *               eventId:
 *                 type: integer
 *                 description: ID of the event to assign the member to
 *               labId:
 *                 type: integer
 *                 description: ID of the lab the event and member belong to
 *     responses:
 *       201:
 *         description: Member successfully assigned to the event
 *       404:
 *         description: Event or Member not found
 *       500:
 *         description: Failed to assign a member to the event
 */
export const assignMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const { memberId, eventId, labId } = req.body;

        // Check if the event exists & assigned to same lab as input
        const event = await prisma.event.findUnique({
            where: { id: eventId, labId: labId },
        });

        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        // Check if the member exists & assigned to same lab as input, event
        const member = await prisma.labMember.findUnique({
            where: { id: memberId, labId: labId },
        });

        if (!member) {
            res.status(404).json({ error: 'Member not found' });
            return;
        }

        // Check if the member is already assigned to the event
        const existingAssignment = await prisma.eventAssignment.findFirst({
            where: {
                memberId,
                eventId,
            },
        });

        if (existingAssignment) {
            res.status(400).json({ error: 'Member is already assigned to this event' });
            return;
        }

        const assignment = await prisma.eventAssignment.create({
            data: {
                memberId,
                eventId,
            },
        });

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign a member to this event'});
    }
};

/**
 * @swagger
 * /calendar/remove-member:
 *   delete:
 *     summary: Removes a member from an event
 *     tags: [Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *               - eventId
 *             properties:
 *               memberId:
 *                 type: integer
 *                 description: The ID of the lab member
 *               eventId:
 *                 type: integer
 *                 description: The ID of the event
 *     responses:
 *       200:
 *         description: Member removed from event successfully
 *       400:
 *         description: Cannot remove the last member assigned to the event
 *       404:
 *         description: Event, Member, or Assignment not found
 *       500:
 *         description: Failed to change member(s) assigned to this event
 */
export const removeMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const { memberId, eventId } = req.body;

        // Check if the event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        // Check if the member exists
        const member = await prisma.labMember.findUnique({
            where: { id: memberId },
        });
        if (!member) {
            res.status(404).json({ error: 'Member not found' });
            return;
        }

        const assignments = await prisma.eventAssignment.findMany({
            where: { eventId },
        });

        // Ensure there is at least one other member assigned to the event
        if (assignments.length <= 1) {
            res.status(400).json({ error: 'Cannot remove the last member assigned to this event' });
            return;
        }

        // Check member's assignment exists
        const assignment = assignments.find((assignment) => assignment.memberId === memberId);
        if (!assignment) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }

        const id = assignment.id;
        // Remove the assignment
        await prisma.eventAssignment.delete({
            where: { id },
        });
        res.status(200).json({ message: 'Member removed from event successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to change member(s) assigned to this event' });
    }
};