const { DataTypes } = require("sequelize");

const sequelize = require("../dbConnect");
const Base = require("./Base");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
 name:{
   type:DataTypes.STRING,
   allowNull:false,
 },

  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  access:{
 type: DataTypes.ENUM("Admin", "Base Commander", "Logistics Officer"),
    allowNull: true
  },
  base_id :{
    type: DataTypes.INTEGER,
    allowNull: true,
    unique:false,
    references:{
        model:Base,
        key:'id'
    }
  }
}, { 
  timestamps: true 
});

User.belongsTo(Base, { foreignKey: 'base_id' });

module.exports = User; 