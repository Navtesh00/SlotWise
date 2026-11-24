import { Appointment } from '../models/appointment.model.js';

export const isSlotAvailable = async (req, res, next) => {
    try {
        const { providerId , slotDate, slotStartTime, slotEndTime } = req.body;

        const existing = await Appointment.findOne({
            provider: providerId,
            slotDate,
            slotStartTime,
            status: { $in: ['pending', 'confirmed'] },
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'This slot is already booked or a request is pending.',
            });
        }

        next();
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};