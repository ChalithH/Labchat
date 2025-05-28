import { z } from "zod";

export const eventSchema = z.object({
  user: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.date({ required_error: "Start date is required" }),
  startTime: z.object({ hour: z.number(), minute: z.number() }, { required_error: "Start time is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  endTime: z.object({ hour: z.number(), minute: z.number() }, { required_error: "End time is required" }),
  // Type field - string representing the type ID
  type: z.string({ required_error: "Event type is required" }),
  // Instrument field - nullable string representing the instrument ID or "none" for no instrument
  instrumentId: z.string().nullable().optional(),
});

export type TEventFormData = z.infer<typeof eventSchema>;