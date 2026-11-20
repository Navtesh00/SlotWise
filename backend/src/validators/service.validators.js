import { z } from 'zod';

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

export const serviceIdParam = z.object({
    params: z.object({
        id: mongoId,
    }),
});

export const createServiceSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Service name must be at least 2 characters'),
        description: z.string().min(5, 'Description must be at least 5 characters'),
        price: z.coerce.number().positive('Price must be a positive number'),
        userId: z.string().optional(),
    }),
});

export const updateServiceSchema = z.object({
    params: z.object({
        id: mongoId,
    }),
    body: z.object({
        name: z.string().min(2).optional(),
        description: z.string().min(5).optional(),
        price: z.coerce.number().positive().optional(),
    }),
});
