import dotenv from 'dotenv';
dotenv.config();



import sequelize from './config/database.js'; 
import express from 'express';
import router from './routes/router.js'; 

const app = express();

app.use(express.json());
app.head('/healthz', (req, res) => {
  res.sendStatus(405); 
});
app.use(router);




sequelize.sync({force:true}).then(() => {
  console.log('Database bootstrapped successfully');
  app.listen(5002, () => {
    console.log(`Server is running on port 5002}`);
  });
}).catch((error) => {
  console.error('Unable to sync the database:', error);
});









export default app;



