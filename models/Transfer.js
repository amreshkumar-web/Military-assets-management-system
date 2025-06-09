const { DataTypes } = require('sequelize');
const sequelize = require('../dbConnect');
const Base = require('./Base');
const EquipmentType = require('./EquipmentType');
const User = require('./User');
const Transfer = sequelize.define('Transfer', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    from_base_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Base,
            key: 'id'
        }
    },
    to_base_id: {
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
    transfer_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
transfer_by:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    }
    ,
    remaining_balance:{
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, { timestamps: true });
Transfer.belongsTo(Base, { foreignKey: 'from_base_id', as: 'fromBase' });
Transfer.belongsTo(Base, { foreignKey: 'to_base_id', as: 'toBase' });
Transfer.belongsTo(EquipmentType, { foreignKey: 'equipment_type_id' });
Transfer.belongsTo(User, { foreignKey: 'transfer_by' });
module.exports = Transfer;