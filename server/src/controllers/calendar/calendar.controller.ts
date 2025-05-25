import { Request, Response } from 'express';
import { Event, Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//Helper functions to validate event input
type EventRequestBody = {
    id?: number;
    labId: number;
    memberId: number;
    title: string;
    description?: string;
    status?: string;
    startTime: string | Date;
    endTime: string | Date;
    instrumentId?: number | null;
    typeId: number;
    assignedMembers?: number[]; 
  };

  interface UpdateEventRequestBody {
    id: string;
    labId?: number;
    memberId?: number; 
    instrumentId?: number | null;
    title?: string;
    description?: string | null;
    status?: string | null;
    startTime?: string | Date;
    endTime?: string | Date;
    typeId?: number; 
    assignedMembers?: number[]; 
}


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

  function validateStartEndDates(start: any, end: any): {errors: string[]; startDate?: Date; endDate?: Date} {
    const errors: string[] = [];

    if (!start || !end) {
        errors.push('Missing start and/or end query parameters');
        return { errors };
    }

    if (typeof start !== 'string' || typeof end !== 'string') {
        errors.push('start and end must be string query parameters');
        return { errors };
      }

    const fixedStart = forceUtcString(start);
    const fixedEnd = forceUtcString(end);

    if (!isValidDate(fixedStart)) {
        errors.push('Invalid start date');
    }
    if (!isValidDate(fixedEnd)) {
        errors.push('Invalid end date');
    }

    const startDate = new Date(fixedStart);
    const endDate = new Date(fixedEnd);

    if (errors.length === 0 && startDate > endDate) {
        errors.push('Start date must be before or equal to end date');
    }

    if (errors.length > 0) {
        return { errors };
    }

    return {errors: [], startDate, endDate};
  }

  function forceUtcString(input: string): string {
    if (input.includes('Z') || input.includes('+') || input.includes('-')) {
        return input; // input string is unchanged if a timezone is already present
    }
    return input + 'Z'; //convert to UTC otherwise
  }


  type EventWithRelations = Prisma.EventGetPayload<{
    include: {
      lab: {
        select: {
          id: true;
          name: true;
        }
      };
    type: {
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
        console.log(event.startTime, event.endTime);
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
 *               status:
 *                 type: string
 *                 nullable: true
 *                 description: Status of the event (e.g., "scheduled", "canceled", "completed")
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Start time of the event (ISO format)
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: End time of the event (ISO format)
 *               type:
 *                 type: string
 *                 nullable: true
 *                 description: Type of event (e.g., "meeting", "training", "experiment")
 *               assignedMembers:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of lab member IDs who are assigned to this event
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the created event
 *                 title:
 *                   type: string
 *                   description: Title of the event
 *                 # Other event properties
 *                 eventAssignments:
 *                   type: array
 *                   description: List of members assigned to the event
 *                 lab:
 *                   type: object
 *                   description: Lab information
 *                 instrument:
 *                   type: object
 *                   nullable: true
 *                   description: Instrument information if applicable
 *       400:
 *         description: Bad request - missing required fields or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */


export const createEvent = async (req: Request<{}, {}, EventRequestBody>, res: Response): Promise<void> => {
    try {        
        
        const {
            labId,
            memberId,
            instrumentId,
            title,
            description,
            status,
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
                    status,
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
                include: {
                    lab: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    type: { 
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
 * /calendar/events/{id}:
 *   put:
 *     summary: Updates an existing event (rostering or equipment)
 *     tags: [Calendar]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the event to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
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
            status,
            startTime,
            endTime,
            typeId, // Changed from 'type' to 'typeId'
            assignedMembers
        } = req.body;


        const existingEvent = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                eventAssignments: true, 
            },
        });

        if (!existingEvent) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }


        const updateData: any = {};
        if (labId !== undefined) updateData.labId = labId;
        if (memberId !== undefined) updateData.memberId = memberId;
        if (instrumentId !== undefined) updateData.instrumentId = instrumentId; // Handle null explicitly
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description; // Handle null explicitly
        if (status !== undefined) updateData.status = status;
        if (startTime !== undefined) updateData.startTime = typeof startTime === 'string' ? new Date(startTime) : startTime;
        if (endTime !== undefined) updateData.endTime = typeof endTime === 'string' ? new Date(endTime) : endTime;
        if (typeId !== undefined) updateData.typeId = typeId; // Changed from 'type'


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
                // 1. Delete existing assignments for this event
                await tx.eventAssignment.deleteMany({
                    where: { eventId: event.id },
                });

                // 2. Create new assignments based on the provided list
                if (assignedMembers.length > 0) {
                    // Optional: Validate if the memberIds in assignedMembers exist in LabMember
                    // This can prevent foreign key errors but adds extra queries.
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
                            skipDuplicates: true // Optional: skip if an assignment already exists (shouldn't happen after deleting)
                         });
                    }
                }
            }

            // Return the updated event with the new assignments included
            return tx.event.findUnique({
                where: { id: event.id },
                include: {
                lab: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                type: { 
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
        });
        if (!updatedEvent) {
            res.status(500).json({ error: 'Failed to create event' });
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
    const { start,end } = req.query;
    
    if (!labId) {
        res.status(400).json({error: 'labId cannot be empty'});
        return;
    }
    
    if (!isValidLabId(labId)) {
        res.status(400).json({error: 'labId must be a positive integer'});
        return;
    }

    const { errors, startDate, endDate } = validateStartEndDates(start, end);

    if (errors.length > 0) {
        res.status(400).json({ error: errors });
        return;
    }

    try {

        //event overlaps start/end if event start date is <= end and event end date >= start   
        const events = await prisma.event.findMany({
            where: {
                labId: Number(labId),
                startTime: { lte: endDate },
                endTime: { gte: startDate },
            },
            include: {
                lab: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                type: { 
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
 *                 example:
 *                   id: 1
 *                   name: "Meeting"
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
            }
        });
        res.json(eventTypes);
    } catch (error) {
        console.error('Error retrieving event types:', error);
        res.status(500).json({ error: 'Failed to retrieve event types' });
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
            include: {
                lab: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                type: {
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