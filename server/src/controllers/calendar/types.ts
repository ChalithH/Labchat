import { Prisma } from '@prisma/client';

// Request body types
export type EventRequestBody = {
    id?: number;
    labId: number;
    memberId: number;
    title: string;
    description?: string;
    statusId?: number; 
    startTime: string | Date;
    endTime: string | Date;
    instrumentId?: number | null;
    typeId: number;
    assignedMembers?: number[]; 
};

export interface UpdateEventRequestBody {
    id: string;
    labId?: number;
    memberId?: number; 
    instrumentId?: number | null;
    title?: string;
    description?: string | null;
    statusId?: number; 
    startTime?: string | Date;
    endTime?: string | Date;
    typeId?: number; 
    assignedMembers?: number[]; 
}

// Database types with relations
export type EventWithRelations = Prisma.EventGetPayload<{
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
                color: true;
            }
        };
        status: {
            select: {
                id: true;
                name: true;
                color: true;
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
                id: true; 
                memberId: true;
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

// Transformed event interface
export interface TransformedEvent extends Omit<EventWithRelations, 'assigner' | 'eventAssignments'> {
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

// Date validation response
export interface DateValidationResult {
    errors: string[];
    startDate?: Date;
    endDate?: Date;
}