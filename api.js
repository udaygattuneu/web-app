
import('dotenv/config');

  
import express from 'express';
import sequelize from './config/sequelize.js'; 
import router from './routes/router.js'; 

const app = express();

app.use(express.json());
app.use(router);

sequelize.sync({ force: true }).then(() => {
  console.log('Database bootstrapped successfully');
  app.listen(5001, () => {
    console.log('Server is running on port 5001');
  });
}).catch((error) => {
  console.error('Unable to sync the database:', error);
});
export default app;