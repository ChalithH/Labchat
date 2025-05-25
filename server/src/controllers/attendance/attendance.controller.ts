import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_LAB_ID = 1; // Remove fallback when multi-lab support works

/**
 * @swagger
 * /attendance/clock-in:
 *   post:
 *     summary: Clock in a lab member
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               labId:
 *                 type: integer
 *                 description: The lab ID (optional, defaults to 1)
 *     responses:
 *       201:
 *         description: Clocked in successfully
 *       400:
 *         description: Already clocked in or bad request
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a member of this lab
 */
export const clockIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user as number;
    const labId = req.body.labId ? Number(req.body.labId) : DEFAULT_LAB_ID;

    if (typeof userId !== 'number') {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    const labMember = await prisma.labMember.findFirst({
      where: {
        userId: userId,
        labId: labId,
      },
    });

    if (!labMember) {
      res.status(403).json({ message: 'User is not a member of this lab or lab does not exist.' });
      return;
    }

    const existingAttendance = await prisma.labAttendance.findFirst({
      where: {
        memberId: labMember.id,
        clockOut: null,
      },
    });

    if (existingAttendance) {
      res.status(400).json({ message: 'User is already clocked in.', attendance: existingAttendance });
      return;
    }

    const newAttendance = await prisma.labAttendance.create({
      data: {
        memberId: labMember.id,
        clockIn: new Date(),
      },
    });

    res.status(201).json({ message: 'Clocked in successfully.', attendance: newAttendance });
    return;
  } catch (error) {
    console.error('Clock-in error:', error);
    res.status(500).json({ message: 'Internal server error during clock-in.' });
    return;
  }
};

/**
 * @swagger
 * /attendance/clock-out:
 *   post:
 *     summary: Clock out a lab member
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               labId:
 *                 type: integer
 *                 description: The lab ID (optional, defaults to 1)
 *     responses:
 *       200:
 *         description: Clocked out successfully
 *       400:
 *         description: Not clocked in or bad request
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a member of this lab
 */
export const clockOut = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user as number;
    const labId = req.body.labId ? Number(req.body.labId) : DEFAULT_LAB_ID;

    if (typeof userId !== 'number') {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    const labMember = await prisma.labMember.findFirst({
      where: {
        userId: userId,
        labId: labId,
      },
    });

    if (!labMember) {
      res.status(403).json({ message: 'User is not a member of this lab or action not permitted.' });
      return;
    }

    const activeAttendance = await prisma.labAttendance.findFirst({
      where: {
        memberId: labMember.id,
        clockOut: null,
      },
      orderBy: {
        clockIn: 'desc',
      },
    });

    if (!activeAttendance) {
      res.status(400).json({ message: 'User is not currently clocked in or no active session found.' });
      return;
    }

    const updatedAttendance = await prisma.labAttendance.update({
      where: {
        id: activeAttendance.id,
      },
      data: {
        clockOut: new Date(),
      },
    });

    res.status(200).json({ message: 'Clocked out successfully.', attendance: updatedAttendance });
    return;
  } catch (error) {
    console.error('Clock-out error:', error);
    res.status(500).json({ message: 'Internal server error during clock-out.' });
    return;
  }
};

/**
 * @swagger
 * /attendance/status:
 *   get:
 *     summary: Get current attendance status for a user in a lab
 *     tags: [Attendance]
 *     parameters:
 *       - in: query
 *         name: labId
 *         schema:
 *           type: integer
 *         description: The lab ID (optional, defaults to 1)
 *     responses:
 *       200:
 *         description: Status returned
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a member of this lab
 */
export const getAttendanceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user as number;
    const labId = req.query.labId ? Number(req.query.labId) : DEFAULT_LAB_ID;

    if (typeof userId !== 'number') {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    const labMember = await prisma.labMember.findFirst({
      where: {
        userId: userId,
        labId: labId,
      },
    });

    if (!labMember) {
      res.status(403).json({ message: 'User is not a member of this lab or lab does not exist.' });
      return;
    }

    const currentAttendance = await prisma.labAttendance.findFirst({
      where: {
        memberId: labMember.id,
        clockOut: null,
      },
      orderBy: {
        clockIn: 'desc',
      },
    });

    if (currentAttendance) {
      res.status(200).json({
        isClockedIn: true,
        clockInTime: currentAttendance.clockIn,
        attendanceId: currentAttendance.id,
      });
      return;
    } else {
      const lastAttendance = await prisma.labAttendance.findFirst({
        where: {
          memberId: labMember.id,
          clockOut: { not: null }
        },
        orderBy: {
          clockOut: 'desc'
        }
      });
      res.status(200).json({
        isClockedIn: false,
        lastClockOutTime: lastAttendance?.clockOut || null
      });
      return;
    }
  } catch (error) {
    console.error('Get attendance status error:', error);
    res.status(500).json({ message: 'Internal server error while fetching attendance status.' });
    return;
  }
};

/**
 * @swagger
 * /attendance/current-members:
 *   get:
 *     summary: Get all currently clocked-in members for a lab
 *     tags: [Attendance]
 *     parameters:
 *       - in: query
 *         name: labId
 *         schema:
 *           type: integer
 *         description: The lab ID (optional, defaults to 1)
 *     responses:
 *       200:
 *         description: List of currently clocked-in members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       role:
 *                         type: string
 *                       image:
 *                         type: string
 *                       statusName:
 *                         type: string
 */
export const getCurrentMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const labId = req.query.labId ? Number(req.query.labId) : 1;
    // Find all LabAttendance records where clockOut is null and member.labId matches
    const attendances = await prisma.labAttendance.findMany({
      where: {
        clockOut: null,
        member: {
          labId: labId,
        },
      },
      include: {
        member: {
          include: {
            user: true,
            labRole: true,
          },
        },
      },
    });
    // Map to Member[]
    const members = attendances.map(a => ({
      name: a.member.user.displayName || a.member.user.firstName || a.member.user.username || 'Unknown',
      role: a.member.labRole?.name || 'Lab Member',
      permissionLevel: a.member.labRole?.permissionLevel ?? 0,
      clockIn: a.clockIn,
      image: '/default_pfp.svg', 
      statusName: 'In Lab',
    }));
    res.status(200).json({ members });
    return;
  } catch (error) {
    console.error('Get current members error:', error);
    res.status(500).json({ message: 'Internal server error while fetching current members.' });
    return;
  }
};

