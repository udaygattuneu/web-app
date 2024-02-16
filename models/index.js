require('dotenv').config();
const dbConfig = require('../src/db-config');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect
});

const db = {};
db.sequelize = sequelize;

db.models = {};
db.models.user = require('./user')(sequelize, Sequelize.DataTypes);

module.exports = db;

