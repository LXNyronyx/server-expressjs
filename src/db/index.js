const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../db_config.json');

class DatabaseContext {
    constructor() {
        this.sequelize = null;
        this.models = {};
        this.isInitialized = false;
    }

    checkConfigExists() {
        return fs.existsSync(CONFIG_FILE);
    }

    async initFromConfig() {
        if (!this.checkConfigExists()) {
            return false;
        }
        
        try {
            const configData = fs.readFileSync(CONFIG_FILE, 'utf-8');
            const config = JSON.parse(configData);
            return await this.connect(config);
        } catch (error) {
            console.error('Error reading DB config:', error);
            return false;
        }
    }

    async connect(config) {
        if (config.db_type === 'sqlite') {
            this.sequelize = new Sequelize({
                dialect: 'sqlite',
                storage: path.join(__dirname, '../database.sqlite'),
                logging: false
            });
        } else if (config.db_type === 'mysql') {
            this.sequelize = new Sequelize(config.db_name, config.db_user, config.db_password, {
                host: config.db_host || 'localhost',
                dialect: 'mysql',
                logging: false
            });
        } else {
            throw new Error('Unsupported database type');
        }

        try {
            await this.sequelize.authenticate();
            this.loadModels();
            await this.sequelize.sync(); // Creates tables if they don't exist
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Database connection failed:', error);
            return false;
        }
    }

    saveConfig(config) {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    }

    loadModels() {
        // Initialize Models
        this.models.User = require('../models/User')(this.sequelize);
        this.models.Contact = require('../models/Contact')(this.sequelize);
        this.models.Product = require('../models/Product')(this.sequelize);
    }
}

// Export a singleton instance
module.exports = new DatabaseContext();
