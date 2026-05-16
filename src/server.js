const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dbContext = require('./db/index');

// Import route modules
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const setupRoutes = require('./routes/setup');

const app = express();
const PORT = process.env.PORT || 3000;

// Apply middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/setup', setupRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Express API. Server is running.' });
});

// Helper function for database connection with retry logic
const connectToDatabaseWithRetry = async (config, retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        const connected = await dbContext.connect(config);
        if (connected) return true;
        
        console.log(`Database connection failed. Retrying in ${delay / 1000} seconds... (${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    return false;
};

// Initialize application
const startServer = async () => {
    try {
        // Attempt to initialize the database from an existing configuration file
        let isDbInitialized = await dbContext.initFromConfig();
        
        if (isDbInitialized) {
            console.log('Database connected and initialized successfully from config.');
        } 
        // Auto-initialize from Environment Variables (Docker deployment)
        else if (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER) {
            console.log('Auto-initializing database from environment variables...');
            
            const config = {
                db_type: process.env.DB_TYPE || 'mysql',
                db_host: process.env.DB_HOST,
                db_name: process.env.DB_NAME,
                db_user: process.env.DB_USER,
                db_password: process.env.DB_PASSWORD || ''
            };
            
            const connected = await connectToDatabaseWithRetry(config);
            
            if (connected) {
                isDbInitialized = true;
                console.log('Database connected and models synced successfully via ENV.');
                
                // Seed default admin user if it doesn't exist
                const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
                const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
                const existingAdmin = await dbContext.models.User.findOne({ where: { email: adminEmail } });
                
                if (!existingAdmin) {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(adminPass, salt);
                    
                    await dbContext.models.User.create({
                        name_id: 'admin',
                        email: adminEmail,
                        pwd_hash: hashedPassword
                    });
                    console.log(`Default admin user created. (Email: ${adminEmail})`);
                }
            } else {
                console.log('Failed to auto-connect using ENV variables. Please check your credentials.');
            }
        }

        if (!isDbInitialized) {
            console.log('Database is not yet configured. Please hit the /setup/init endpoint via the React Frontend.');
        }

        // Start listening for incoming requests
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
};

startServer();
