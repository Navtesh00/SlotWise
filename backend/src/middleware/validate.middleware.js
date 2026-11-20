import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });
        next();
    } catch (err) {
        const errors = err.issues.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
        }));
        res.status(400).json({ success: false, message: 'Validation error', errors });
    }
};
