const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Contact', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        contact_key: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        contact_value: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'contacts',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });
};
