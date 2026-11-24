import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Service name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        duration: {
            type: Number,
            required: [true, 'Service duration is required'],
            min: [5, 'Duration must be at least 5 minutes'],
        },
    },
    { timestamps: true }
);

serviceSchema.index({ user: 1, name: 1 }, { unique: true });

export const Service = mongoose.model('Service', serviceSchema);
