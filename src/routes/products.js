const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dbContext = require('../db');

// Ensure this matches the secret used in auth.js
const ENV_SECRET = process.env.JWT_SECRET;
const JWT_SECRET = ENV_SECRET || 'your_jwt_secret_key';

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Get products with pagination (Dashboard Feed) - Protected route
router.get('/', authenticateToken, async (req, res) => {
    if (!dbContext.isInitialized) {
        return res.status(503).json({ error: 'System not configured yet.' });
    }

    // Default to page 1, limit to 10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await dbContext.models.Product.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['created_at', 'DESC']] // Latest products first
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            products: rows
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new product (For testing/admin) - Protected route
router.post('/', authenticateToken, async (req, res) => {
    if (!dbContext.isInitialized) return res.status(503).json({ error: 'System not configured yet.' });

    try {
        const product = await dbContext.models.Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create product' });
    }
});

module.exports = router;
