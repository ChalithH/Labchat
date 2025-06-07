// services/eventStatusService.ts
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();

/**
 * Updates events that have elapsed (end time has passed)
 * Runs every 15 minutes to check for elapsed events
 */
export async function updateElapsedEvents(): Promise<void> {
    try {
        const now = new Date();
        
        // Get the "elapsed" status ID
        const elapsedStatus = await prisma.eventStatus.findUnique({
            where: { name: 'elapsed' }
        });
        
        if (!elapsedStatus) {
            console.error('Elapsed status not found in database');
            return;
        }

        // Find events that have ended but are not in a final state
        const eventsToUpdate = await prisma.event.findMany({
            where: {
                endTime: { lt: now },
                status: {
                    name: {
                        notIn: ['cancelled', 'completed', 'elapsed']
                    }
                }
            },
            include: {
                status: true,
                type: true
            }
        });

        if (eventsToUpdate.length > 0) {
            // Update all elapsed events
            const updateResult = await prisma.event.updateMany({
                where: {
                    id: { in: eventsToUpdate.map(e => e.id) }
                },
                data: {
                    statusId: elapsedStatus.id
                }
            });

            console.log(`Updated ${updateResult.count} events to elapsed status at ${now.toISOString()}`);
        }
    } catch (error) {
        console.error('Error updating elapsed events:', error);
    }
}

/**
 * Initialize the cron job to run every 15 minutes
 */
export function initializeStatusUpdateService(): void {
    // Run every 15 minutes: "0 */15 * * * *"
    cron.schedule('0 */15 * * * *', async () => {
        console.log('Running scheduled event status update...');
        await updateElapsedEvents();
    }, {
        timezone: 'UTC'
    });

    console.log('Event status update service initialized - running every 15 minutes');
    
    // Run once on startup
    updateElapsedEvents();
}

/**
 * Get the appropriate default status based on event type
 */
export async function getDefaultStatusForEventType(typeName: string): Promise<number> {
    const isBookingType = typeName.toLowerCase().includes('booking');
    const defaultStatusName = isBookingType ? 'booked' : 'scheduled';
    
    const status = await prisma.eventStatus.findUnique({
        where: { name: defaultStatusName }
    });
    
    if (!status) {
        throw new Error(`Default status '${defaultStatusName}' not found`);
    }
    
    return status.id;
}

/**
 * Check if a status change is valid for the given event type
 */
export function isValidStatusChange(eventTypeName: string, newStatusName: string): boolean {
    const isBookingType = eventTypeName.toLowerCase().includes('booking');
    
    if (isBookingType) {
        // Booking events can be: booked, cancelled, elapsed
        return ['booked', 'cancelled', 'elapsed'].includes(newStatusName);
    } else {
        // Task/Other events can be: scheduled, completed, cancelled, elapsed  
        return ['scheduled', 'completed', 'cancelled', 'elapsed'].includes(newStatusName);
    }
}