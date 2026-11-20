import express from 'express';
import { register, login, logout } from '../controllers/auth.controllers.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validators.js';

const router = express.Router();


router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.delete('/logout', logout);

export default router;
