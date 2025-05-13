import { Request, Response } from 'express';
import { prisma } from '../..';


export const getMemberById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.labMember.findUnique({
      where: { id },
    });
    
    if (!user) {
      res.status(404).json({ error: 'Lab member not found' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve lab member' });
  }
};

export const getMemberByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.labMember.findFirst({
      where: { userId: id },
    });
    
    if (!user) {
      res.status(404).json({ error: 'Lab member not found' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve lab member' });
  }
};