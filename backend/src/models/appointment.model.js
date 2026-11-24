import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
    {
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        slotDate: {
            type: Date,
            required: true,
        },
        slotStartTime: {
            type: String,
            required: true,
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'],
        },
        slotEndTime: {
            type: String,
            required: true,
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'],
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
            default: 'pending',
        },
        price: {
            type: Number,
            required: true,
        },
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        confirmedAt: {
            type: Date,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

appointmentSchema.index({ provider: 1, status: 1 });
appointmentSchema.index({ customer: 1, status: 1 });
appointmentSchema.index({ provider: 1, slotDate: 1, slotStartTime: 1 });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
