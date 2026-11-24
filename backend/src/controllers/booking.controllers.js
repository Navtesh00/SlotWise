import { Service } from '../models/service.model.js';
import { Appointment } from '../models/appointment.model.js';

/**
 * Parse HH:mm to minutes since midnight
 */
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

export const requestBooking = async (req, res) => {
    try {
        const { providerId, serviceId, slotDate, slotStartTime, slotEndTime, notes } = req.body;
        const customerId = req.user._id;

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        if (service.user.toString() !== providerId) {
            return res.status(400).json({
                success: false,
                message: 'Service does not belong to this provider',
            });
        }

        const requestedDate = new Date(`${slotDate}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 30);

        if (requestedDate < today) {
            return res.status(400).json({ success: false, message: 'Cannot book past dates' });
        }
        if (requestedDate > maxDate) {
            return res.status(400).json({ success: false, message: 'Booking window exceeded' });
        }

        const durationMinutes = service.duration;
        const startTotal = timeToMinutes(slotStartTime);
        const endTotal = timeToMinutes(slotEndTime);

        if (endTotal - startTotal !== durationMinutes) {
            return res.status(400).json({
                success: false,
                message: `Slot duration must match service duration (${durationMinutes} minutes)`,
            });
        }

        const existing = await Appointment.findOne({
            provider: providerId,
            slotDate: requestedDate,
            slotStartTime,
            status: { $in: ['pending', 'confirmed'] },
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'This slot is already booked or a request is pending.',
            });
        }

        const appointment = await Appointment.create({
            provider: providerId,
            service: serviceId,
            customer: customerId,
            slotDate: requestedDate,
            slotStartTime,
            slotEndTime,
            status: 'pending',
            price: service.price,
            notes,
        });

        const populated = await Appointment.findById(appointment._id)
            .populate('service', 'name description price duration')
            .populate('customer', 'name email')
            .populate('provider', 'name email');

        res.status(201).json({
            success: true,
            message: 'Booking request sent successfully',
            appointment: populated,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ customer: req.user._id })
            .populate('service', 'name description price duration')
            .populate('provider', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            appointments,
            count: appointments.length,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getProviderRequests = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            provider: req.user._id,
            status: 'pending',
        })
            .populate('service', 'name description price duration')
            .populate('customer', 'name email')
            .sort({ requestedAt: -1 });

        res.status(200).json({
            success: true,
            appointments,
            count: appointments.length,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const approveAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findOneAndUpdate(
            { _id: id, provider: req.user._id, status: 'pending' },
            { status: 'confirmed', confirmedAt: new Date() },
            { new: true }
        )
            .populate('service', 'name description price duration')
            .populate('customer', 'name email')
            .populate('provider', 'name email');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment request not found or already processed',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Appointment approved successfully',
            appointment,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const rejectAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findOneAndUpdate(
            { _id: id, provider: req.user._id, status: 'pending' },
            { status: 'rejected' },
            { new: true }
        )
            .populate('service', 'name description price duration')
            .populate('customer', 'name email')
            .populate('provider', 'name email');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment request not found or already processed',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Appointment rejected successfully',
            appointment,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findOneAndUpdate(
            { _id: id, customer: req.user._id, status: { $in: ['pending', 'confirmed'] } },
            { status: 'cancelled' },
            { new: true }
        )
            .populate('service', 'name description price duration')
            .populate('provider', 'name email');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found or cannot be cancelled',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully',
            appointment,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
