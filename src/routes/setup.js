const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const dbContext = require('../db');

router.post('/init', async (req, res) => {
    // If already initialized, reject
    if (dbContext.isInitialized) {
        return res.status(400).json({ error: 'System is already configured.' });
    }

    const { 
        admin_email, 
        admin_password, 
        admin_password_confirm, 
        db_type, 
        db_host, 
        db_name, 
        db_user, 
        db_password 
    } = req.body;

    // Validation
    if (!admin_email || !admin_password || !admin_password_confirm || !db_type) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    if (admin_password !== admin_password_confirm) {
        return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (db_type === 'mysql' && (!db_name || !db_user)) {
        return res.status(400).json({ error: 'MySQL requires database name and user.' });
    }

    const config = { db_type, db_host, db_name, db_user, db_password };

    try {
        // Attempt to connect and sync DB
        const connected = await dbContext.connect(config);
        
        if (!connected) {
            return res.status(500).json({ error: 'Failed to connect to database using provided credentials.' });
        }

        // Save valid config to file
        dbContext.saveConfig(config);

        // Hash password and create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin_password, salt);

        await dbContext.models.User.create({
            name_id: 'admin',
            email: admin_email,
            pwd_hash: hashedPassword
        });

        res.status(200).json({ message: 'Setup completed successfully. Server is ready.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error during setup.' });
    }
});

router.get('/status', (req, res) => {
    res.json({ isConfigured: dbContext.isInitialized });
});

module.exports = router;
