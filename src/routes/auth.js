const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbContext = require('../db');

const JWT_SECRET = 'YOUR_SUPER_SECRET_KEY'; // In production, move this to ENV vars

router.post('/login', async (req, res) => {
    if (!dbContext.isInitialized) {
        return res.status(503).json({ error: 'System not configured yet.' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const user = await dbContext.models.User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.pwd_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user.id, name_id: user.name_id }, JWT_SECRET, { expiresIn: '1d' });

        res.json({ message: 'Login successful', token, name_id: user.name_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
