import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import serviceRoutes from './routes/services.route.js';
import bookingRoutes from './routes/booking.route.js';
import availabilityRoutes from './routes/availability.route.js';
import { errorHandler } from './middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// Serve static test pages
app.use('/test', express.static(path.join(__dirname, '../public')));

// Serve static assets at root so /css/style.css and /js/api.js resolve
app.use(express.static(path.join(__dirname, '../public')));

// Redirect /test to /test/index.html
app.get('/test', (req, res) => {
    res.redirect('/test/index.html');
});

app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/service', serviceRoutes);

app.use('/api/v1/booking', bookingRoutes);

app.use('/api/v1/availability', availabilityRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

export default app;