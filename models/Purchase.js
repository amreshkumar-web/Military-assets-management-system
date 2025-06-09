const { DataTypes } = require('sequelize');
const sequelize = require('../dbConnect');
const Base = require('./Base');
const EquipmentType = require('./EquipmentType');
const User = require('./User');
const Purchase = sequelize.define('Purchase', {
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
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    updated_balance:{
        type: DataTypes.INTEGER,
        allowNull: true
    }
    ,
    purchase_by:{ 
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: User,
            key:'id' 
        }
    }
    ,
    purchase_date: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, { timestamps: true });
Purchase.belongsTo(Base, { foreignKey: 'base_id' });
Purchase.belongsTo(EquipmentType, { foreignKey: 'equipment_type_id' });
Purchase.belongsTo(User, { foreignKey: 'purchase_by' });

module.exports = Purchase;