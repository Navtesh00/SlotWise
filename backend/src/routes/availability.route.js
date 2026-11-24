import express from 'express';
import {
    getAvailableSlots,
    getProviderAvailability,
    setAvailability,
    addException,
    deleteException,
} from '../controllers/availability.controllers.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
    availabilityQuerySchema,
    availabilitySchema,
    exceptionSchema,
} from '../validators/booking.validators.js';

const router = express.Router();

// Public slot availability (no auth needed to view slots)
router.get('/availability', validate(availabilityQuerySchema), getAvailableSlots);

// Provider-owned availability management
router.get('/', protect, authorize('provider'), getProviderAvailability);
router.post('/', protect, authorize('provider'), validate(availabilitySchema), setAvailability);
router.post('/exception', protect, authorize('provider'), validate(exceptionSchema), addException);
router.delete('/exception/:id', protect, authorize('provider'), deleteException);

export default router;
