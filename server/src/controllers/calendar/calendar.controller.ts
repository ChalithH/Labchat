import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//Helper functions to validate event input
type BaseEventInput = {
    id?: number;
    labId: number;
    memberId: number;
    title: string;
    description?: string;
    status?: string;
    startTime: string | Date;
    endTime: string | Date;
  };
  
  type RosteringEventInput = BaseEventInput & {
    type: 'rostering';
  };
  
  type EquipmentEventInput = BaseEventInput & {
    type: 'equipment';
    instrumentId: number;
  };
  
  type EventRequestBody = RosteringEventInput | EquipmentEventInput;


  function isValidDate(val: any): boolean {
    return !isNaN(new Date(val).getTime());
  }
  
  function validateBaseFields(body: any): string[] {
    const errors: string[] = [];
  
    if (typeof body.labId !== 'number') errors.push('labId must be a number');
    if (typeof body.memberId !== 'number') errors.push('memberId must be a number');
    if (typeof body.title !== 'string') errors.push('title must be a string');
    if (!isValidDate(body.startTime)) errors.push('startTime must be a valid date');
    if (!isValidDate(body.endTime)) errors.push('endTime must be a valid date');
  
    return errors;
  }
  
  function validateRosteringEvent(body: any): string[] {
    const errors = validateBaseFields(body);
    if (body.type !== 'rostering') errors.push('type must be "rostering"');
    return errors;
  }
  
  function validateEquipmentEvent(body: any): string[] {
    const errors = validateBaseFields(body);
    if (typeof body.instrumentId !== 'number') errors.push('instrumentId must be a number');
    if (body.type !== 'equipment') errors.push('type must be "equipment"');
    return errors;
  }


/**
 * @swagger
 * /calendar/create-event:
 *   post:
 *     summary: Creates a new rostering or equipment event
 *     tags: [Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - labId
 *               - memberId
 *               - title
 *               - startTime
 *               - endTime
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [rostering, equipment]
 *                 description: Type of the event
 *               labId:
 *                 type: integer
 *                 description: ID of the lab where the event is scheduled
 *               memberId:
 *                 type: integer
 *                 description: ID of the lab member associated with the event
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
 *               status:
 *                 type: string
 *                 description: Status of the event (e.g., scheduled, cancelled)
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Start time of the event
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: End time of the event
 *     responses:
 *       201:
 *         description: Event successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error or invalid event type
 *       500:
 *         description: Failed to create event
 */

export const createEvent = async (req: Request<{}, {}, EventRequestBody>, res: Response): Promise<void> => {
    try {
        const eventType = req.body.type;

        let errors: string[] = [];

        if (eventType === 'rostering') {
          errors = validateRosteringEvent(req.body);
        } else if (eventType === 'equipment') {
          errors = validateEquipmentEvent(req.body);
        } else {
          res.status(400).json({ error: 'Invalid event type' });
          return;
        }
    
        if (errors.length > 0) {
          res.status(400).json({ error: errors });
          return;
        }

        if (eventType === 'rostering') {
            const { labId, memberId, title, description, status, startTime, endTime } = req.body;

            const newEvent = await prisma.event.create({
                data: {
                    labId,
                    memberId,
                    title,
                    description,
                    status,
                    startTime: startTime,
                    endTime: endTime,
                    type: 'rostering',
                }
            });

            res.status(201).json(newEvent);

        } else if (eventType === 'equipment') {
            const { labId, memberId, instrumentId, title, description, status, startTime, endTime } = req.body;

            const newEvent = await prisma.event.create({
                data: {
                    labId,
                    memberId,
                    instrumentId,
                    title,
                    description,
                    status,
                    startTime: startTime,
                    endTime: endTime,
                    type: 'equipment',
                }
            });

            res.status(201).json(newEvent);

        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create event' });
    }
}
/**
 * @swagger
 * /calendar/update-event:
 *   put:
 *     summary: Updates an existing event (rostering or equipment)
 *     tags: [Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - type
 *               - labId
 *               - memberId
 *               - title
 *               - startTime
 *               - endTime
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID of the event to update
 *               type:
 *                 type: string
 *                 enum: [rostering, equipment]
 *                 description: Type of the event
 *               labId:
 *                 type: integer
 *                 description: ID of the lab where the event is scheduled
 *               memberId:
 *                 type: integer
 *                 description: ID of the lab member associated with the event
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
 *               status:
 *                 type: string
 *                 description: Status of the event (e.g., scheduled, cancelled)
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Start time of the event
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: End time of the event
 *     responses:
 *       201:
 *         description: Event successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error or invalid event type
 *       404:
 *         description: Event not found
 *       500:
 *         description: Failed to update event
 */

export const updateEvent = async (req: Request<{}, {}, EventRequestBody>, res: Response): Promise<void> => {
    try {
        const eventId = req.body.id;

        const eventtoUpdate = await prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!eventtoUpdate) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        const eventType = req.body.type;

        let errors: string[] = [];

        if (eventType === 'rostering') {
          errors = validateRosteringEvent(req.body);
        } else if (eventType === 'equipment') {
          errors = validateEquipmentEvent(req.body);
        } else {
          res.status(400).json({ error: 'Invalid event type' });
          return;
        }
    
        if (errors.length > 0) {
          res.status(400).json({ error: errors });
          return;
        }

        if (eventType === 'rostering') {
            const { labId, memberId, title, description, status, startTime, endTime } = req.body;

            const updatedEvent = await prisma.event.update({
                where: {
                    id: eventId,
                  },
                data: {
                    labId,
                    memberId,
                    title,
                    description,
                    status,
                    startTime: startTime,
                    endTime: endTime,
                    type: 'rostering',
                }
            });

            res.status(201).json(updatedEvent);

        } else if (eventType === 'equipment') {
            const { labId, memberId, instrumentId, title, description, status, startTime, endTime } = req.body;

            const updatedEvent = await prisma.event.update({
                where: {
                    id: eventId,
                  },
                data: {
                    labId,
                    memberId,
                    instrumentId,
                    title,
                    description,
                    status,
                    startTime: startTime,
                    endTime: endTime,
                    type: 'equipment',
                }
            });

            res.status(201).json(updatedEvent);

        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update event' });
    }
}
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
 *             properties:
 *               memberId:
 *                 type: integer
 *                 description: ID of the lab member to assign
 *               eventId:
 *                 type: integer
 *                 description: ID of the event to assign the member to
 *     responses:
 *       201:
 *         description: Member successfully assigned to the event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventAssignment'
 *       404:
 *         description: Event or Member not found
 *       500:
 *         description: Failed to assign a member to the event
 */

export const assignMember = async (req: Request, res: Response): Promise<void> => {
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

        // Create the assignment
        const assignment = await prisma.eventAssignment.create({
            data: {
                memberId,
                eventId,
            },
        });

        res.status(201).json(assignment);

    } catch (error) {
        res.status(500).json({ error: 'Failed to assign a member to this event' });
    }

}

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
 *               - id
 *               - memberId
 *               - eventId
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The ID of the event assignment to delete
 *               memberId:
 *                 type: integer
 *                 description: The ID of the lab member
 *               eventId:
 *                 type: integer
 *                 description: The ID of the event
 *     responses:
 *       200:
 *         description: Member removed from event successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Member removed from event successfully
 *       400:
 *         description: Cannot remove the last member assigned to the event
 *       404:
 *         description: Event, Member, or Assignment not found
 *       500:
 *         description: Failed to change member(s) assigned to this event
 */

export const removeMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id,  memberId, eventId } = req.body;

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
        // Check if the assignment exists
        const assignment = await prisma.eventAssignment.findUnique({
            where: { id },
        });
        if (!assignment) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }
        // Ensure there is at least one other member assigned to the event
        const assignments = await prisma.eventAssignment.findMany({
            where: { eventId },
        });
        if (assignments.length <= 1) {
            res.status(400).json({ error: 'Cannot remove the last member assigned to this event' });
            return;
        }
        // Remove the assignment
        await prisma.eventAssignment.delete({
            where: { id },
        });
        res.status(200).json({ message: 'Member removed from event successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Failed to change member(s) assigned to this event' });
    }

}

