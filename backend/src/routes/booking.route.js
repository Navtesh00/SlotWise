import express from 'express';
import {
    requestBooking,
    getMyAppointments,
    getProviderRequests,
    approveAppointment,
    rejectAppointment,
    cancelAppointment,
} from '../controllers/booking.controllers.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { isSlotAvailable } from '../middleware/booking.middleware.js';
import {
    bookingRequestSchema,
    appointmentIdParam,
} from '../validators/booking.validators.js';

const router = express.Router();

// Customer requests a booking slot
router.post(
    '/request',
    protect,
    validate(bookingRequestSchema),
    isSlotAvailable,
    requestBooking
);

// Customer's own appointments
router.get('/me', protect, getMyAppointments);

// Provider's pending requests
router.get('/provider/requests', protect, authorize('provider'), getProviderRequests);

// Provider approves/rejects
router.patch('/:id/approve', protect, authorize('provider'), validate(appointmentIdParam), approveAppointment);
router.patch('/:id/reject', protect, authorize('provider'), validate(appointmentIdParam), rejectAppointment);

// Customer cancels
router.patch('/:id/cancel', protect, authorize('user'), validate(appointmentIdParam), cancelAppointment);

export default router;
