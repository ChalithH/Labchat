import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PERMISSIONS } from '../../config/permissions';

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

/**
 * @swagger
 * /attendance/logs/{labId}:
 *   get:
 *     summary: Get attendance logs for a specific lab
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The lab ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs up to this date
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: integer
 *         description: Filter by specific lab member
 *     responses:
 *       200:
 *         description: List of attendance logs
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view this lab's logs
 */
export const getAttendanceLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user as number;
    const labId = Number(req.params.labId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const memberId = req.query.memberId ? Number(req.query.memberId) : undefined;

    if (typeof userId !== 'number') {
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    // Check if user has permission to view this lab's attendance logs
    // Admin users can view any lab, lab managers can view their own lab
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) {
      res.status(401).json({ message: 'User not found.' });
      return;
    }

    const isAdmin = user.role.permissionLevel >= PERMISSIONS.GLOBAL_ADMIN;
    
    if (!isAdmin) {
      // Check if user is a lab manager for this lab
      const labMember = await prisma.labMember.findFirst({
        where: {
          userId: userId,
          labId: labId,
          labRole: {
            permissionLevel: { gte: 70 }
          }
        }
      });

      if (!labMember) {
        res.status(403).json({ message: 'Not authorized to view this lab\'s attendance logs.' });
        return;
      }
    }

    // Build where clause for filtering
    const whereClause: any = {
      member: {
        labId: labId
      }
    };

    if (memberId) {
      whereClause.memberId = memberId;
    }

    if (startDate || endDate) {
      whereClause.clockIn = {};
      if (startDate) {
        whereClause.clockIn.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.clockIn.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.labAttendance.count({
      where: whereClause
    });

    // Get paginated logs
    const logs = await prisma.labAttendance.findMany({
      where: whereClause,
      include: {
        member: {
          include: {
            user: true,
            labRole: true
          }
        }
      },
      orderBy: {
        clockIn: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Format the response
    const formattedLogs = logs.map(log => ({
      id: log.id,
      memberId: log.memberId,
      memberName: log.member.user.displayName || `${log.member.user.firstName} ${log.member.user.lastName}`,
      memberRole: log.member.labRole?.name || 'Lab Member',
      clockIn: log.clockIn,
      clockOut: log.clockOut,
      duration: log.clockOut ? Math.floor((log.clockOut.getTime() - log.clockIn.getTime()) / 1000 / 60) : null, // Duration in minutes
      isActive: !log.clockOut
    }));

    res.status(200).json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
    return;
  } catch (error) {
    console.error('Get attendance logs error:', error);
    res.status(500).json({ message: 'Internal server error while fetching attendance logs.' });
    return;
  }
};

