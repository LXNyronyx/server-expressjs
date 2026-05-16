const express = require('express');
const router = express.Router();
const dbContext = require('../db');

// Get products with pagination (Dashboard Feed)
router.get('/', async (req, res) => {
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

// Create a new product (For testing/admin)
router.post('/', async (req, res) => {
    if (!dbContext.isInitialized) return res.status(503).json({ error: 'System not configured yet.' });

    try {
        const product = await dbContext.models.Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create product' });
    }
});

module.exports = router;
