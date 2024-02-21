
import Sequelize from 'sequelize';
import dotenv from 'dotenv';


dotenv.config();

const sequelize = new Sequelize(
    process.env.DATABASE_Name, 
    process.env.DATABASE_USER, 
    process.env.DATABASE_PASSWORD, {
    host: process.env.DB_HOSTNAME,
    dialect: 'mysql',
    logging: false 
});

export default sequelize;
