const { DataTypes } = require("sequelize");

const sequelize = require("../dbConnect");
const EquipmentType = sequelize.define("EquipmentType", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    }
    }, { 
    timestamps: true 
})


module.exports = EquipmentType;