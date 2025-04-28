import { Request, Response } from 'express';
import { Event, Prisma, PrismaClient } from '@prisma/client';

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

  function isValidLabId(val: string) {
    const num = Number(val);
    return Number.isInteger(num) && num > 0 && val === String(num);
  }


  type EventWithRelations = Prisma.EventGetPayload<{
    include: {
      lab: {
        select: {
          id: true;
          name: true;
        }
      };
      assigner: {
        select: {
          id: true;
          user: {
            select: {
              displayName: true;
            }
          }
        }
      };
      instrument: {
        select: {
          id: true;
          name: true;
        }
      };
      eventAssignments: {
        select: {
          id: true; memberId: true;
          member: {
            select: {
              user: {
                select: {
                  displayName: true;
                }
              }
            }
          }
        }
      };
    }
  }>;
  
  interface TransformedEvent extends Omit<EventWithRelations, 'assigner' | 'eventAssignments'> {
    assigner: {
      id: number;
      name: string;
    };
    eventAssignments: Array<{
      id: number;
      memberId: number;
      name: string;
    }>;
  }
  
  /**
   * Helper function to transform event data by flattening nested structures
   * @param events The events retrieved from the database with their relations
   * @returns Transformed events with flattened structure
   */
  const transformEvents = (events: EventWithRelations[]): TransformedEvent[] => {
    return events.map(event => {
      return {
        ...event,
        assigner: {
          id: event.assigner.id,
          name: event.assigner.user.displayName
        },
        eventAssignments: event.eventAssignments.map(assignment => ({
          id: assignment.id,
          memberId: assignment.memberId,
          name: assignment.member.user.displayName
        }))
      };
    });
  };

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
 *               - labId
 *               - memberId
 *               - title
 *               - startTime
 *               - endTime
 *               - type
 *             properties:
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
 *               type:
 *                 type: string
 *                 enum: [rostering, equipment]
 *                 description: Type of the event
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
 *               - labId
 *               - memberId
 *               - title
 *               - startTime
 *               - endTime
 *               - type
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID of the event to update
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
 *               type:
 *                 type: string
 *                 enum: [rostering, equipment]
 *                 description: Type of the event
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Event deleted successfully
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
 *       500:
 *         description: Failed to delete event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to delete event
 */

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const eventId: number = req.body.id;

        // Check if the event exists
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

        res.status(200).json({event,  message: 'Event deleted successfully' });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete event' });
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
        const { memberId, eventId, labId } = req.body;

        // Check if the event exists & assigned to same lab as input
        const event = await prisma.event.findUnique({
            where: { id: eventId, labId: labId },
        });

        if (!event) {
            res.status(404).json({ error: 'Event not found' });
        }

        // Check if the member exists & assigned to same lab as input, event
        const member = await prisma.labMember.findUnique({
            where: { id: memberId, labId: labId },
        });

        if (!member) {
            res.status(404).json({ error: 'Member not found' });
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
        const {memberId, eventId } = req.body;

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

}



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

    if (!labId) {
        res.status(400).json({error: 'labId cannot be empty'});
        return;
    }
    
    if(!isValidLabId(labId)) {
        res.status(400).json({error: 'labId must be a positive integer'});
        return;
    }

    try {
        const events = await prisma.event.findMany({
            where: {
                labId: Number(labId)
            },
            include: {
                lab: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                assigner: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                displayName: true
                            }
                        }
                    }
                },
                instrument: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                eventAssignments: {
                    select: {
                        id: true,
                        memberId: true,
                        member: {
                            select: {
                                user: {
                                    select: {
                                        displayName: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        // Use the global transformation function
        const transformedEvents = transformEvents(events);
        
        res.json(transformedEvents);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve events'});
    }
}

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

    if (!labId || !memberId) {
        res.status(400).json({error: 'Both labId and memberId are required'});
        return;
    }
    
    if(!isValidLabId(labId)) { 
        res.status(400).json({error: 'labId must be a positive integer'});
        return;
    }
    
    if(!isValidLabId(memberId)) { 
        res.status(400).json({error: 'memberId must be a positive integer'});
        return;
    }

    try {
        const labIdNum = Number(labId);
        const memberIdNum = Number(memberId);

        // Get events where the member is assigned (in eventAssignments)
        const events = await prisma.event.findMany({
            where: {
              labId: labIdNum,
              eventAssignments: {
                some: {
                  memberId: memberIdNum,
                },
              },
            },
            include: {
                lab: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                assigner: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                displayName: true
                            }
                        }
                    }
                },
                instrument: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                eventAssignments: {
                    select: {
                        id: true,
                        memberId: true,
                        member: {
                            select: {
                                user: {
                                    select: {
                                        displayName: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        // Use the imported transformation function
        const transformedEvents = transformEvents(events);
        
        res.json(transformedEvents);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve events'});
    }
}