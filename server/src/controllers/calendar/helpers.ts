import { EventWithRelations, TransformedEvent, DateValidationResult } from './types';

/**
 * Validates if a value is a valid date
 */
export function isValidDate(val: any): boolean {
    return !isNaN(new Date(val).getTime());
}

/**
 * Validates base fields for event creation/update
 */
export function validateBaseFields(body: any): string[] {
    const errors: string[] = [];

    if (typeof body.labId !== 'number') errors.push('labId must be a number');
    if (typeof body.memberId !== 'number') errors.push('memberId must be a number');
    if (typeof body.title !== 'string') errors.push('title must be a string');
    if (!isValidDate(body.startTime)) errors.push('startTime must be a valid date');
    if (!isValidDate(body.endTime)) errors.push('endTime must be a valid date');

    return errors;
}

/**
 * Validates rostering event specific fields
 */
export function validateRosteringEvent(body: any): string[] {
    const errors = validateBaseFields(body);
    if (body.type !== 'rostering') errors.push('type must be "rostering"');
    return errors;
}

/**
 * Validates equipment event specific fields
 */
export function validateEquipmentEvent(body: any): string[] {
    const errors = validateBaseFields(body);
    if (typeof body.instrumentId !== 'number') errors.push('instrumentId must be a number');
    if (body.type !== 'equipment') errors.push('type must be "equipment"');
    return errors;
}

/**
 * Validates if a lab ID is valid
 */
export function isValidLabId(val: string): boolean {
    const num = Number(val);
    return Number.isInteger(num) && num > 0 && val === String(num);
}

/**
 * Forces a string to be UTC if no timezone is present
 */
export function forceUtcString(input: string): string {
    if (input.includes('Z') || input.includes('+') || input.includes('-')) {
        return input; // input string is unchanged if a timezone is already present
    }
    return input + 'Z'; //convert to UTC otherwise
}

/**
 * Validates start and end date parameters
 */
export function validateStartEndDates(start: any, end: any): DateValidationResult {
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

    return { errors: [], startDate, endDate };
}

/**
 * Transforms event data by flattening nested structures
 * @param events The events retrieved from the database with their relations
 * @returns Transformed events with flattened structure
 */
export function transformEvents(events: EventWithRelations[]): TransformedEvent[] {
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
}

/**
 * Standard include object for event queries
 */
export const EVENT_INCLUDE = {
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
};