const dbPool = require("../src/db-config");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbPool.DB, dbPool.USER, dbPool.PASSWORD, {
  host: dbPool.HOST,
  dialect: dbPool.dialect,
  logging: false,

  pool: {
    max: dbPool.pool.max,
    min: dbPool.pool.min,
    acquire: dbPool.pool.acquire,
    idle: dbPool.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
// db.sequelize = sequelize;

module.exports = db;