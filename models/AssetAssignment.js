const { DataTypes } = require("sequelize");
const sequelize = require("../dbConnect");
const Base = require("./Base");
const User = require("./User");
const EquipmentType = require("./EquipmentType");

const AssetAssignment = sequelize.define("AssetAssignment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
 equipment_type_id:{
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
            model: EquipmentType,
            key: 'id'
        }
 },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
            model: User,
            key: 'id'
        }
  },
  assigned_by: {
    type: DataTypes.INTEGER, 
    allowNull: false,
     references: {
            model: User,
            key: 'id'
        }
  },
  base_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
     references: {
            model: Base,
            key: 'id'
        }
  }, 
  quantity:{
    type: DataTypes.INTEGER, 
    allowNull: false
  },
 
  remarks: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});
AssetAssignment.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
AssetAssignment.belongsTo(User, { foreignKey: 'assigned_by', as: 'assigner' });
AssetAssignment.belongsTo(Base, { foreignKey: 'base_id' });
AssetAssignment.belongsTo(EquipmentType, { foreignKey: 'equipment_type_id' }); 
module.exports = AssetAssignment;