import { ProviderAvailability } from '../models/providerAvailability.model.js';
import { AvailabilityException } from '../models/availabilityException.model.js';
import { Service } from '../models/service.model.js';
import { Appointment } from '../models/appointment.model.js';

const BOOKING_WINDOW_DAYS = 30;

/**
 * Parse HH:mm to minutes since midnight *
 */
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Format minutes since midnight to HH:mm
 */
const minutesToTime = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, '0');
    const m = (totalMinutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

/**
 * Generate 30-minute UTC slots between start and end (provider-local minutes)
 */
const generateSlotsInRange = (startMinutes, endMinutes, durationMinutes) => {
    const slots = [];
    for (let t = startMinutes; t + durationMinutes <= endMinutes; t += durationMinutes) {
        slots.push({
            start: t,
            end: t + durationMinutes,
        });
    }
    return slots;
};

/**
 * Check if two time ranges (in minutes) overlap
 */
const rangesOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

export const getAvailableSlots = async (req, res) => {
    try {
        const { providerId, serviceId, date } = req.query;

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const durationMinutes = service.duration;

        const requestedDate = new Date(`${date}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + BOOKING_WINDOW_DAYS);

        if (requestedDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book slots for past dates',
            });
        }

        if (requestedDate > maxDate) {
            return res.status(400).json({
                success: false,
                message: `Booking window is ${BOOKING_WINDOW_DAYS} days ahead`,
            });
        }

        const dayOfWeek = requestedDate.getDay();

        // Fetch weekly availability for this day
        const weekly = await ProviderAvailability.findOne({
            provider: providerId,
            dayOfWeek,
            isActive: true,
        });

        // Fetch exceptions for this exact date
        const exceptions = await AvailabilityException.find({
            provider: providerId,
            date: requestedDate,
        });

        // Build available windows in provider-local minutes
        let windows = [];

        const blockedException = exceptions.find((e) => e.type === 'blocked');
        if (blockedException) {
            // Entire day blocked
            return res.status(200).json({
                success: true,
                message: 'No slots available for this date',
                slots: [],
            });
        }

        const overrideException = exceptions.find((e) => e.type === 'override');

        if (weekly && !overrideException) {
            windows.push({
                start: timeToMinutes(weekly.startTime),
                end: timeToMinutes(weekly.endTime),
            });
        } else if (overrideException) {
            windows.push({
                start: timeToMinutes(overrideException.startTime),
                end: timeToMinutes(overrideException.endTime),
            });
        }

        if (windows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No availability set for this date',
                slots: [],
            });
        }

        // Generate candidate slots
        const candidateSlots = [];
        for (const window of windows) {
            const slotList = generateSlotsInRange(
                window.start,
                window.end,
                durationMinutes
            );
            for (const s of slotList) {
                candidateSlots.push({
                    startTime: minutesToTime(s.start),
                    endTime: minutesToTime(s.end),
                });
            }
        }

        // Fetch existing appointments for this provider on this date
        const existingAppointments = await Appointment.find({
            provider: providerId,
            slotDate: requestedDate,
            status: { $in: ['pending', 'confirmed'] },
        });

        // Filter out slots that overlap existing appointments
        const availableSlots = candidateSlots.filter((slot) => {
            const slotStart = timeToMinutes(slot.startTime);
            const slotEnd = timeToMinutes(slot.endTime);
            return !existingAppointments.some((appt) => {
                const apptStart = timeToMinutes(appt.slotStartTime);
                const apptEnd = timeToMinutes(appt.slotEndTime);
                return rangesOverlap(slotStart, slotEnd, apptStart, apptEnd);
            });
        });

        // Convert to UTC timestamps
        const slotsWithUTC = availableSlots.map((slot) => {
            const [sh, sm] = slot.startTime.split(':').map(Number);
            const [eh, em] = slot.endTime.split(':').map(Number);
            const startUTC = new Date(requestedDate);
            startUTC.setUTCHours(sh, sm, 0, 0);
            const endUTC = new Date(requestedDate);
            endUTC.setUTCHours(eh, em, 0, 0);

            return {
                startTime: slot.startTime,
                endTime: slot.endTime,
                startTimeUTC: startUTC.toISOString(),
                endTimeUTC: endUTC.toISOString(),
                isAvailable: true,
            };
        });

        res.status(200).json({
            success: true,
            message: 'Available slots fetched successfully',
            slots: slotsWithUTC,
            count: slotsWithUTC.length,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getProviderAvailability = async (req, res) => {
    try {
        const availability = await ProviderAvailability.find({
            provider: req.user._id,
        }).sort({ dayOfWeek: 1, startTime: 1 });
        const exceptions = await AvailabilityException.find({
            provider: req.user._id,
        }).sort({ date: 1 });

        res.status(200).json({
            success: true,
            availability,
            exceptions,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const setAvailability = async (req, res) => {
    try {
        const { dayOfWeek, startTime, endTime } = req.body;

        const availability = await ProviderAvailability.findOneAndUpdate(
            { provider: req.user._id, dayOfWeek },
            { startTime, endTime, isActive: true },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Availability set successfully',
            availability,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const addException = async (req, res) => {
    try {
        const { date, type, startTime, endTime, reason } = req.body;

        const exceptionDate = new Date(`${date}T00:00:00`);

        const exception = await AvailabilityException.create({
            provider: req.user._id,
            date: exceptionDate,
            type,
            startTime,
            endTime,
            reason,
        });

        res.status(201).json({
            success: true,
            message: 'Availability exception added successfully',
            exception,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteException = async (req, res) => {
    try {
        const { id } = req.params;
        const exception = await AvailabilityException.findOneAndDelete({
            _id: id,
            provider: req.user._id,
        });

        if (!exception) {
            return res.status(404).json({ success: false, message: 'Exception not found' });
        }

        res.status(200).json({ success: true, message: 'Exception deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};