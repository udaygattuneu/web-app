
import express from 'express';
import sequelize from './config/database.js'; 
import router from './routes/router.js'; 

const app = express();

app.use(express.json());
app.use(router);

sequelize.sync({ force: true }).then(() => {
  console.log('Database bootstrapped successfully');
  app.listen(8080, () => {
    console.log('Server is running on port 8080');
  });
}).catch((error) => {
  console.error('Unable to sync the database:', error);
});
export default app;
