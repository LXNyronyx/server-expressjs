const express = require('express');
const cors = require('cors');
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

// Initialize application
const startServer = async () => {
    try {
        // Attempt to initialize the database from an existing configuration file
        const isDbInitialized = await dbContext.initFromConfig();
        
        if (isDbInitialized) {
            console.log('Database connected and initialized successfully from config.');
        } else {
            console.log('Database is not yet configured. Please hit the /setup/init endpoint.');
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
