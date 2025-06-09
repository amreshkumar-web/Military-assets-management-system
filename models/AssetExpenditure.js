const { DataTypes } = require("sequelize");
const sequelize = require("../dbConnect");

const AssetExpenditure = sequelize.define("AssetExpenditure", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  equipment_stock_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  expended_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  expended_to: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  expended_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: false
});

module.exports = AssetExpenditure;