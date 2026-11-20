import { Service } from '../models/service.model.js';

export const getAllServices = async (req, res) => {
    try {
        const all = await Service.find().populate('user', 'name email role');
        res.status(200).json({ message: 'All services fetched successfully', services: all, count: all.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getMyServices = async (req, res) => {
    try {
        const userId = req.user._id;
        const my = await Service.find({ user: userId }).populate('user', 'name email role');
        res.status(200).json({ message: 'My services fetched successfully', services: my, count: my.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findById(id).populate('user', 'name email role');
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.status(200).json({ message: 'Service fetched successfully', service });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createServiceController = async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const userId = req.user._id;

        const service = await Service.create({ name, description, price: Number(price), user: userId });

        res.status(201).json({ message: 'Service created successfully', service });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'You already have a service with this name' });
        }
        res.status(500).json({ message: err.message });
    }
};

export const updateServiceController = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price } = req.body;
        const userId = req.user._id;

        const service = await Service.findOneAndUpdate(
            { _id: id, user: userId },
            { name, description, price: price !== undefined ? Number(price) : undefined },
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.status(200).json({ message: 'Service updated successfully', service });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'You already have a service with this name' });
        }
        res.status(500).json({ message: err.message });
    }
};

export const deleteServiceController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const service = await Service.findOneAndDelete({ _id: id, user: userId });

        if (!service) {
            return res.status(404).json({ message: 'Service not found or you are not authorized to delete it.' });
        }

        res.status(200).json({ message: 'Service deleted successfully', service });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
