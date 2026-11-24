import { User } from '../models/user.model.js';
import { ProviderAvailability } from '../models/providerAvailability.model.js';
import { generateToken, setTokenCookie } from '../utils/jwt.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, role, dayOfWeek, startTime, endTime } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });
        }

        if (role === 'admin') {
            return res.status(403).json({ success: false, message: 'Cannot self-register as admin' });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({ name, email, password, role: role || 'user' });

        // If provider with availability fields, create availability record
        if (user.role === 'provider' && dayOfWeek !== undefined && startTime && endTime) {
            await ProviderAvailability.create({
                provider: user._id,
                dayOfWeek: parseInt(dayOfWeek),
                startTime,
                endTime, 
                isActive: true,
            });
        }

        const token = generateToken(user._id, user.role);
        setTokenCookie(res, token);

        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { user: userWithoutPassword },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(user._id, user.role);
        setTokenCookie(res, token);

        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: { user: userWithoutPassword },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logout successful' });
};
