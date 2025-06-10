const { DataTypes } = require('sequelize');
const sequelize = require('../dbConnect');
const Base = require('./Base');
const EquipmentType = require('./EquipmentType');
const EquipmentStock = sequelize.define('EquipmentStock', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    base_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Base,
            key: 'id'
        }
    },
    equipment_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: EquipmentType,
            key: 'id'
        }
    },
    opening_balance: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    closing_balance: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    current_balance: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
    ,
    month: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, { timestamps: true });
EquipmentStock.beforeCreate((stock, options) => {
    if (stock.current_balance === undefined || stock.current_balance === null) {
        stock.current_balance = stock.opening_balance;
    }
});

EquipmentStock.belongsTo(Base, { foreignKey: 'base_id' });
EquipmentStock.belongsTo(EquipmentType, { foreignKey: 'equipment_type_id' });

module.exports = EquipmentStock;