import mongoose from 'mongoose';

const availabilityExceptionSchema = new mongoose.Schema(
    {
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
        },
        startTime: {
            type: String,
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'],
        },
        endTime: {
            type: String,
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'],
        },
        type: {
            type: String,
            enum: ['override', 'blocked'],
            required: [true, 'Exception type is required'],
        },
        reason: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

availabilityExceptionSchema.index({ provider: 1, date: 1 });

export const AvailabilityException = mongoose.model(
    'AvailabilityException',
    availabilityExceptionSchema
);
