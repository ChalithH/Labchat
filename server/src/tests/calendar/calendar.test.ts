import { prisma } from "../../prisma";
import request from "supertest";
import app from "../../app";

describe("Calendar Controllers", () => {
    // Test data IDs that should exist in production seed data
    let testLabId: number;
    let testMemberId: number;
    let testEventTypeId: number;
    let testEventStatusId: number;
    let testInstrumentId: number;
    let testEventId: number;

    beforeAll(async () => {
        // Get test data from seeded production data
        const lab = await prisma.lab.findFirst();
        const member = await prisma.labMember.findFirst();
        const eventType = await prisma.eventType.findFirst();
        const eventStatus = await prisma.eventStatus.findFirst();
        const instrument = await prisma.instrument.findFirst();

        if (!lab || !member || !eventType || !eventStatus) {
            throw new Error("Required seed data not found");
        }

        testLabId = lab.id;
        testMemberId = member.id;
        testEventTypeId = eventType.id;
        testEventStatusId = eventStatus.id;
        testInstrumentId = instrument?.id || 1; // fallback
    });

    afterEach(async () => {
        // Clean up any test events created during tests
        if (testEventId) {
            try {
                await prisma.event.delete({ where: { id: testEventId } });
            } catch (error) {
                // Event might not exist or already deleted
            }
            testEventId = 0;
        }
    });

    describe("Constants Controller", () => {
        test("should get all event types", async () => {
            const response = await request(app)
                .get("/api/calendar/getEventTypes")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty("id");
            expect(response.body[0]).toHaveProperty("name");
            expect(response.body[0]).toHaveProperty("color");
        });

        test("should get all instruments", async () => {
            const response = await request(app)
                .get("/api/calendar/get-instruments")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            if (response.body.length > 0) {
                expect(response.body[0]).toHaveProperty("id");
                expect(response.body[0]).toHaveProperty("name");
            }
        });
    });

    describe("Status Controller", () => {
        test("should get all event statuses", async () => {
            const response = await request(app)
                .get("/api/calendar/get-statuses")
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty("id");
            expect(response.body[0]).toHaveProperty("name");
            expect(response.body[0]).toHaveProperty("color");
        });
    });

    describe("Event Controller", () => {
        test("should get lab events with valid parameters", async () => {
            const start = "2024-01-01T00:00:00Z";
            const end = "2024-12-31T23:59:59Z";

            const response = await request(app)
                .get(`/api/calendar/events/${testLabId}?start=${start}&end=${end}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            // Each event should have transformed structure
            if (response.body.length > 0) {
                const event = response.body[0];
                expect(event).toHaveProperty("id");
                expect(event).toHaveProperty("title");
                expect(event).toHaveProperty("startTime");
                expect(event).toHaveProperty("endTime");
                expect(event).toHaveProperty("assigner");
                expect(event.assigner).toHaveProperty("name");
                expect(event).toHaveProperty("eventAssignments");
            }
        });

        test("should return 400 for invalid lab ID", async () => {
            const start = "2024-01-01T00:00:00Z";
            const end = "2024-12-31T23:59:59Z";

            await request(app)
                .get(`/api/calendar/events/invalid?start=${start}&end=${end}`)
                .expect(400);
        });

        test("should return 400 for missing date parameters", async () => {
            await request(app).get(`/api/calendar/events/${testLabId}`).expect(400);
        });

        test("should get member events", async () => {
            const start = "2024-01-01T00:00:00Z";
            const end = "2024-12-31T23:59:59Z";

            const response = await request(app)
                .get(
                    `/api/calendar/member-events/${testLabId}/${testMemberId}?start=${start}&end=${end}`
                )
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe("CRUD Controller", () => {
        test("should create a new event", async () => {
            const eventData = {
                labId: testLabId,
                memberId: testMemberId,
                title: "Test Event",
                description: "Test event description",
                startTime: "2024-06-15T10:00:00Z",
                endTime: "2024-06-15T11:00:00Z",
                typeId: testEventTypeId,
                assignedMembers: [testMemberId],
            };

            const response = await request(app)
                .post("/api/calendar/create-event")
                .send(eventData)
                .expect(201);

            expect(response.body).toHaveProperty("id");
            expect(response.body.title).toBe("Test Event");
            expect(response.body.assigner).toHaveProperty("name");

            // Store for cleanup
            testEventId = response.body.id;
        });

        test("should return 400 for missing required fields in create event", async () => {
            const invalidEventData = {
                labId: testLabId,
                // Missing required fields
                title: "Test Event",
            };

            await request(app)
                .post("/api/calendar/create-event")
                .send(invalidEventData)
                .expect(400);
        });

        test("should create recurring events", async () => {
            const recurringEventData = {
                labId: testLabId,
                memberId: testMemberId,
                title: "Recurring Test Event",
                description: "Test recurring event",
                startTime: "2024-06-15T10:00:00Z",
                endTime: "2024-06-15T11:00:00Z",
                typeId: testEventTypeId,
                frequency: "weekly",
                repetitions: 3,
                assignedMembers: [testMemberId],
            };

            const response = await request(app)
                .post("/api/calendar/create-recurring-events")
                .send(recurringEventData)
                .expect(201);

            expect(response.body).toHaveProperty("eventsCreated");
            expect(response.body.eventsCreated).toBe(3);
            expect(Array.isArray(response.body.events)).toBe(true);
            expect(response.body.events).toHaveLength(3);

            // Clean up created events
            for (const event of response.body.events) {
                await prisma.event.delete({ where: { id: event.id } });
            }
        });

        test("should assign member to event", async () => {
            // First create an event
            const event = await prisma.event.create({
                data: {
                    labId: testLabId,
                    memberId: testMemberId,
                    title: "Test Event for Assignment",
                    startTime: new Date("2024-06-15T10:00:00Z"),
                    endTime: new Date("2024-06-15T11:00:00Z"),
                    statusId: testEventStatusId,
                    typeId: testEventTypeId,
                },
            });

            testEventId = event.id;

            const assignmentData = {
                memberId: testMemberId,
                eventId: event.id,
                labId: testLabId,
            };

            const response = await request(app)
                .post("/api/calendar/assign-member")
                .send(assignmentData)
                .expect(201);

            expect(response.body).toHaveProperty("id");
            expect(response.body.memberId).toBe(testMemberId);
            expect(response.body.eventId).toBe(event.id);
        });

        test("should delete an event", async () => {
            // First create an event
            const event = await prisma.event.create({
                data: {
                    labId: testLabId,
                    memberId: testMemberId,
                    title: "Test Event for Deletion",
                    startTime: new Date("2024-06-15T10:00:00Z"),
                    endTime: new Date("2024-06-15T11:00:00Z"),
                    statusId: testEventStatusId,
                    typeId: testEventTypeId,
                },
            });

            const response = await request(app)
                .delete("/api/calendar/delete-event")
                .send({ id: event.id })
                .expect(200);

            expect(response.body).toHaveProperty("message");
            expect(response.body.message).toBe("Event deleted successfully");

            // Verify event is deleted
            const deletedEvent = await prisma.event.findUnique({
                where: { id: event.id },
            });
            expect(deletedEvent).toBeNull();
        });
    });

    describe("Event Validation", () => {
        test("should return 400 for end time before start time", async () => {
            const invalidEventData = {
                labId: testLabId,
                memberId: testMemberId,
                title: "Invalid Event",
                startTime: "2024-06-15T11:00:00Z",
                endTime: "2024-06-15T10:00:00Z", // End before start
                typeId: testEventTypeId,
            };

            await request(app)
                .post("/api/calendar/create-event")
                .send(invalidEventData)
                .expect(400);
        });

        test("should return 400 for invalid event type", async () => {
            const invalidEventData = {
                labId: testLabId,
                memberId: testMemberId,
                title: "Invalid Event",
                startTime: "2024-06-15T10:00:00Z",
                endTime: "2024-06-15T11:00:00Z",
                typeId: 99999, // Non-existent type ID
            };

            await request(app)
                .post("/api/calendar/create-event")
                .send(invalidEventData)
                .expect(400);
        });
    });

    describe("Status Changes", () => {
        test("should change event status", async () => {
            // First create an event
            const event = await prisma.event.create({
                data: {
                    labId: testLabId,
                    memberId: testMemberId,
                    title: "Test Event for Status Change",
                    startTime: new Date("2024-06-15T10:00:00Z"),
                    endTime: new Date("2024-06-15T11:00:00Z"),
                    statusId: testEventStatusId,
                    typeId: testEventTypeId,
                },
            });

            testEventId = event.id;

            // Get a different status
            const newStatus = await prisma.eventStatus.findFirst({
                where: { id: 2 },
            });
            if (newStatus) {
                const statusChangeData = {
                    eventId: event.id,
                    statusName: newStatus.name,
                };
                // We expect 400 here since its not a valid status change
                // Booking events can be: booked, cancelled, elapsed
                // Task/Other events can be: scheduled, completed, cancelled, elapsed
                const response = await request(app)
                    .put("/api/calendar/change-status")
                    .send(statusChangeData)
                    .expect(400);

            }
            
            // Get a different status
            const newStatus2 = await prisma.eventStatus.findFirst({
                where: { id: 3 },
            });
            if (newStatus2) {
                const statusChangeData = {
                    eventId: event.id,
                    statusName: newStatus2.name,
                };
                // We expect 200 now since calcelled is a valid status for any event. 
                const response = await request(app)
                    .put("/api/calendar/change-status")
                    .send(statusChangeData)
                    .expect(200);

                expect(response.body.status.name).toBe(newStatus2.name);
            }

        });
    });
});
