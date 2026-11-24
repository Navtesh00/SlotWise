import { Service } from '../models/service.model.js';

export const getAllServices = async (req, res) => {
    try {
        const all = await Service.find().populate('user', 'name email role');
        res.status(200).json({
            success: true,
            message: 'All services fetched successfully',
            data: { services: all, count: all.length },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getMyServices = async (req, res) => {
    try {
        const userId = req.user._id;
        const my = await Service.find({ user: userId }).populate('user', 'name email role');
        res.status(200).json({
            success: true,
            message: 'My services fetched successfully',
            data: { services: my, count: my.length },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findById(id).populate('user', 'name email role');
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Service fetched successfully',
            data: { service },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const createService = async (req, res) => {
    try {
        const { name, description, price, duration } = req.body;
        const userId = req.user._id;

        const service = await Service.create({
            name,
            description,
            price: Number(price),
            duration: Number(duration),
            user: userId,
        });

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: { service },
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'You already have a service with this name' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, duration } = req.body;
        const userId = req.user._id;

        const service = await Service.findOneAndUpdate(
            { _id: id, user: userId },
            {
                name,
                description,
                price: price !== undefined ? Number(price) : undefined,
                duration: duration !== undefined ? Number(duration) : undefined,
            },
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found in your account' });
        }

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: { service },
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'You already have a service with this name' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const service = await Service.findOneAndDelete({ _id: id, user: userId });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found or you are not authorized to delete it.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully',
            data: { service },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
