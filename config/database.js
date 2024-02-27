import Sequelize from 'sequelize';
import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
// import path from 'path';

dotenv.config();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
console.log("DB Name:", process.env.DB_NAME);
console.log("DB User:", process.env.DB_USER);
console.log("DB Password:", process.env.DB_PASSWORD);
console.log("DB Host:", process.env.DB_HOST);


// const mypath = path.join(__dirname, './.env');
// const sequelize = new Sequelize(
    
//     "db1", 
//   "root", 
//     "Uday123@", 
//     {
//     host: "localhost",
//     dialect: 'mysql',
//     logging: false 
// });
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

