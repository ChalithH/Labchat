import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createEvent = async (req: Request, res: Response): Promise<void> => {
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


