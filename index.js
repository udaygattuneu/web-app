
import express from 'express';
import sequelize from './config/database.js'; 
import router from './routes/router.js'; 

const app = express();

app.use(express.json());
app.use(router);
import dotenv from "dotenv";

dotenv.config();
console.log("Database Host:", process.env.DB_HOST);
console.log("Database User:", process.env.DB_USER);
console.log("Database Name:", process.env.DB_NAME);
console.log("Database Password:", process.env.DB_PASSWORD);
console.log("Database Port:", process.env.DB_PORT);

sequelize.sync({ force: false }).then(() => {
  console.log('Database bootstrapped successfully');
  app.listen(8080, () => {
    console.log('Server is running on port 8080');
  });
}).catch((error) => {
  console.error('Unable to sync the database:', error);
});
export default app;
