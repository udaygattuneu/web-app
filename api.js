// // require('dotenv').config();
// const path = require('path')
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
// const validator = require('validator');
// const { response } = require('express');
// const express = require('express');
// const bcrypt = require('bcryptjs');
// const dbPool = require('../config/sequelize');
// const app = express();
// const port = 3004;
// const bodyParser = require('body-parser');
// const db = require('../models')
// app.use(bodyParser.json());


// app.use((request, response, next) => {
//     response.setHeader('Cache-Control', 'no-cache, no-store');
//     next();
//   });

//   app.use("/healthz",(req, res, next) => {
//     if (req.method === 'HEAD') {
//       res.status(405).end();
//     } else {
//       next();
//     }
//   });

//   app.get('/healthz', async (req, res) => {
//     try {
//       await db.sequelize.authenticate(); // Try to authenticate with the database
//       res.status(200).send(); // If successful, send a 200 status code
//     } catch (error) {
//       console.error('Database connection failed:', error);
//       res.status(503).send(); // If there's an error, send a 503 status code
//     }
//   });
  

  
//   app.post('/v1/user',async(req,res)=>{
//     try{
//         const {email,password,firstName,lastName} = req.body;
//         if (!email || !password || !firstName || !lastName) {
//           return res.status(400).send("Bad Request: Missing required fields.");
//       }
//       else if( !validator.isEmail(email)){
//         return res.status(400).send("Bad Request: Missing required fields.");

//       }
//         const hashedpassword = await bcrypt.hash(password,10);
//         const user = await db.models.user.create({
//             email,
//             password: hashedpassword,
//             firstName,
//             lastName
//         })
//         res.status(201).json({userId:user.id, email:user.email,firstName:user.firstName,lastName:user.lastName})
//     }
//     catch(error){
//         if(error.name === 'SequelizeUniqueConstraintError'){
//             res.status(400).send("Email already exists")
//         }
//         else if (error.name=="SequelizeValidationError"){
//           const messages = error.errors.map(e=>e.message)
//           res.status(400).send(`Validation error : ${messages.json(";")}`)
//         }
//         else{
//             res.status(500).send("Server Error");
//         }
//     }
//   })
 
//   const dbConnectionCheckMiddleware = async (req, res, next) => {
//     try {
//       await db.sequelize.authenticate();
//       next(); // Database is connected, proceed to the next middleware/route handler
//     } catch (error) {
//       // Database connection failed
//       res.status(503).send("Service Unavailable - Database connection failed");
//     }
//   };
//   app.use(dbConnectionCheckMiddleware);

//   const basicAuthMiddleware = async (req, res, next) => {
//     // Check for basic auth header
//     if (!req.headers.authorization || !req.headers.authorization.startsWith('Basic ')) {
//         return res.status(401).json({ message: 'Missing Authorization Header' });
//     }

//     // Extract base64 encoded username and password
//     const base64Credentials = req.headers.authorization.split(' ')[1];
//     const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
//     const [email, password] = credentials.split(':');

//     try {
//         // Find user by email
//         const user = await db.models.user.findOne({ where: { email } });
//         if (!user) {
//             return res.status(401).json({ message: 'Invalid Authentication Credentials' });
//         }

//         // Compare provided password with stored hashed password
//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             return res.status(401).json({ message: 'Invalid Authentication Credentials' });
//         }

//         // Authentication successful, store user details for next middleware
//         req.user ={
//           firstName: user.firstName,
//           lastName: user.lastName,
//           email: user.email,
//           accountCreated: user.accountCreated, // Make sure these field names match your model

 
  
  
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