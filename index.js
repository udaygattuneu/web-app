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




// sequelize.sync().then(() => {
//   console.log('Database bootstrapped successfully');
//   app.listen(5002, () => {
//     console.log(`Server is running on port 5002}`);
//   });
// }).catch((error) => {
//   console.error('Unable to sync the database:', error);
// });

let retries = 3;
const delay = 5000; // Delay in milliseconds

function syncDatabase(retriesLeft = retries) {
  sequelize.sync().then(() => {
    console.log('Database schema synchronized successfully.');
    app.listen(5002, () => {
      console.log(`Server is running on port 5002}`);
    });
  }).catch((error) => {
    console.error('Unable to sync the database:', error);
    if (retriesLeft > 0) {
      console.log(`Retrying... (${retriesLeft} attempts left)`);
      setTimeout(() => syncDatabase(retriesLeft - 1), delay);
    } else {
      console.error('All retry attempts failed. Exiting the application...');
      // Exit the application or any other logic to handle the failure
      process.exit(1);
    }
  });
}

// Initial call to the function
syncDatabase();







export default app;



