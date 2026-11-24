import mongoose from 'mongoose';

const providerAvailabilitySchema = new mongoose.Schema(
    {
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        dayOfWeek: {
            type: Number,
            required: [true, 'Day of week is required (0-6)'],
            min: 0,
            max: 6,
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required (HH:mm)'],
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'],
        },
        endTime: {
            type: String,
            required: [true, 'End time is required (HH:mm)'],
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

providerAvailabilitySchema.index({ provider: 1, dayOfWeek: 1 });

export const ProviderAvailability = mongoose.model(
    'ProviderAvailability',
    providerAvailabilitySchema
);
