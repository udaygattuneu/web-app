import Sequelize from 'sequelize';
import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
// import path from 'path';

dotenv.config();




const sequelize = new Sequelize(
    
  process.env.DB_NAME, 
process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false 
});

export default sequelize;

