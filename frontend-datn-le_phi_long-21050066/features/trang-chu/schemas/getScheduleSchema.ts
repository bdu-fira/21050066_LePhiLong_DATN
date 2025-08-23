import { z } from "zod";

export const dayItemSchema = z.object({
  date: z.string().min(1),        // YYYY-MM-DD
  exercises: z.number().int().min(0),
  calories: z.number().min(0),
});

export const weekItemSchema = z.object({
  weekLabel: z.string().min(1),   // "Tuần 1 (01/07–07/07)"
  startDate: z.string().min(1),   // YYYY-MM-DD
  endDate: z.string().min(1),     // YYYY-MM-DD
  days: z.array(dayItemSchema).length(7), // đủ 7 ngày (Mon–Sun)
});

export const getScheduleResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    weeks: z.array(weekItemSchema),
  }),
});

export type DayItem = z.infer<typeof dayItemSchema>;
export type WeekItem = z.infer<typeof weekItemSchema>;
export type GetScheduleResponse = z.infer<typeof getScheduleResponseSchema>;
