import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import sequelize from './config/database.js'; 
import router from './routes/router.js'; 

const app = express();

app.use(express.json());
app.head('/healthz', (req, res) => {
  res.sendStatus(405); 
});
app.use(router);



const portt = 5002;
sequelize.sync({force:true}).then(() => {
  console.log('Database bootstrapped successfully');
  app.listen(portt, () => {
    console.log(`Server is running on port ${portt}`);
  });
}).catch((error) => {
  console.error('Unable to sync the database:', error);
});
export default app;


