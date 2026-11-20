import express from 'express';
import {
    getAllServices,
    getMyServices,
    getServiceById,
    createServiceController as createService,
    updateServiceController as updateService,
    deleteServiceController as deleteService,
} from '../controllers/service.controllers.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
    serviceIdParam,
    createServiceSchema,
    updateServiceSchema,
} from '../validators/service.validators.js';

const router = express.Router();

router.get('/all-services', getAllServices);
router.get('/my-services', protect, authorize('provider'), getMyServices);
router.get('/:id', validate(serviceIdParam), getServiceById);
router.post('/', protect, authorize('provider'), validate(createServiceSchema), createService);
router.patch('/:id', protect, authorize('provider'), validate(updateServiceSchema), updateService);
router.delete('/:id', protect, authorize('provider'), validate(serviceIdParam), deleteService);

export default router;