// db.js
require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite:./database.sqlite');

// // const sequelize = new Sequelize('sqlite:./database.sqlite');

// const user = sequelize.define('user', {
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   firstName: DataTypes.STRING,
//   lastName: DataTypes.STRING,
//   accountCreated: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW
//   },
//   accountUpdated: DataTypes.DATE
// });

// (async () => {
//   await sequelize.sync({ force: true });
//   console.log("The table for the User model was just (re)created!");
// })();

// module.exports = { user };

module.exports = (sequelize, DataTypes) => {
  // const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = new Sequelize('sqlite:./database.sqlite');


 
const user = sequelize.define('user', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  accountCreated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  accountUpdated: DataTypes.DATE
});

  
  return user;
}
// (async () => {
//   await sequelize.sync({ force: true });
//   console.log("The table for the User model was just (re)created!");
// })();
