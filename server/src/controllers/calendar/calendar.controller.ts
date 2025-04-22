import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//Helper functions to validate event input
type BaseEventInput = {
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

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const eventType = req.body.eventType;

        if (eventType === 'rostering') {
            const { id, start, end, title, description } = req.body;
        } else if (eventType === 'equipment') {
            const { id, start, end, title, description } = req.body;
        } else {
            res.status(400).json({ error: 'Invalid event type' });
        }

    } catch (error) {
        res.status(500).json({ error: 'Failed to update event' });
    }

}

export const assignMember = async (req: Request, res: Response): Promise<void> => {
    try {

    } catch (error) {
        res.status(500).json({ error: 'Failed to assign a member to this event' });
    }

}

export const changeMembers = async (req: Request, res: Response): Promise<void> => {
    try {

    } catch (error) {
        res.status(500).json({ error: 'Failed to change member(s) assigned to this event' });
    }

}



