import { z } from 'zod';

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

const timeStr = z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)');

export const availabilityQuerySchema = z.object({
    query: z.object({
        providerId: mongoId,
        serviceId: mongoId,
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    }),
});

export const bookingRequestSchema = z.object({
    body: z.object({
        providerId: mongoId,
        serviceId: mongoId,
        slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        slotStartTime: timeStr,
        slotEndTime: timeStr,
        notes: z.string().optional(),
    }),
});

export const availabilitySchema = z.object({
    body: z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: timeStr,
        endTime: timeStr,
    }),
});

export const exceptionSchema = z.object({
    body: z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        type: z.enum(['override', 'blocked']),
        startTime: timeStr.optional(),
        endTime: timeStr.optional(),
        reason: z.string().optional(),
    }),
});

export const appointmentIdParam = z.object({
    params: z.object({
        id: mongoId,
    }),
});
