const { DataTypes } = require("sequelize");

const sequelize = require("../dbConnect");
const User = require("./User")

const Session = sequelize.define("SessionToken", {
  
 refreshToken:{
   type:DataTypes.STRING,
   allowNull:true,
 },

  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references:{
        model:User,
        key:'id'
    } 
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
}, { 
  timestamps: true 
});

Session.belongsTo(User,{foreignKey:'id'});


module.exports = Session; 