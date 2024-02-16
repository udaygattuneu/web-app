// require('dotenv').config();
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const validator = require('validator');
const { response } = require('express');
const express = require('express');
const bcrypt = require('bcryptjs');
const dbPool = require('../config/sequelize');
const app = express();
const port = 3006;
const bodyParser = require('body-parser');
const db = require('../models')
app.use(bodyParser.json());


app.use((request, response, next) => {
    response.setHeader('Cache-Control', 'no-cache, no-store');
    next();
  });

  app.use("/healthz",(req, res, next) => {
    if (req.method === 'HEAD') {
      res.status(405).end();
    } else {
      next();
    }
  });

  
  app.post('/v1/user',async(req,res)=>{
    try{
        const {email,password,firstName,lastName} = req.body;
        if (!email || !password || !firstName || !lastName) {
          return res.status(400).send("Bad Request: Missing required fields.");
      }
      else if( !validator.isEmail(email)){
        return res.status(400).send("Bad Request: Missing required fields.");

      }
        const hashedpassword = await bcrypt.hash(password,10);
        const user = await db.models.user.create({
            email,
            password: hashedpassword,
            firstName,
            lastName
        })
        res.status(201).json({userId:user.id, email:user.email,firstName:user.firstName,lastName:user.lastName})
    }
    catch(error){
        if(error.name === 'SequelizeUniqueConstraintError'){
            res.status(400).send("Email already exists")
        }
        else if (error.name=="SequelizeValidationError"){
          const messages = error.errors.map(e=>e.message)
          res.status(400).send(`Validation error : ${messages.json(";")}`)
        }
        else{
            res.status(500).send("Server Error");
        }
    }
  })
 
  const dbConnectionCheckMiddleware = async (req, res, next) => {
    try {
      await db.sequelize.authenticate();
      next(); // Database is connected, proceed to the next middleware/route handler
    } catch (error) {
      // Database connection failed
      res.status(503).send("Service Unavailable - Database connection failed");
    }
  };
  app.use(dbConnectionCheckMiddleware);

  const basicAuthMiddleware = async (req, res, next) => {
    // Check for basic auth header
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Basic ')) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }

    // Extract base64 encoded username and password
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    try {
        // Find user by email
        const user = await db.models.user.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid Authentication Credentials' });
        }

        // Compare provided password with stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid Authentication Credentials' });
        }

        // Authentication successful, store user details for next middleware
        req.user ={
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          accountCreated: user.accountCreated, // Make sure these field names match your model
          accountUpdated: user.accountUpdated
        };

        next();
    } catch (error) {
      console.error(error)
        return res.status(500).json({ message: 'Server error during authentication' });
    }
};

  app.get('/v1/user/self', basicAuthMiddleware, (req, res) => {
    // User is already authenticated at this point, and user details are stored in req.user
    const { firstName, lastName, email,accountCreated,accountUpdated } = req.user;
    res.status(200).json({
        firstName,
        lastName,
        email,
        accountCreated,
        accountUpdated
    });
});

app.put('/v1/user/self', basicAuthMiddleware, async (req, res) => {
  try {
      const { firstName, lastName, password } = req.body;
     

      // Optional: Validate the input here (e.g., check for empty strings)

      // Assuming req.user.email contains the authenticated user's email
      const userEmail = req.user.email;

      // Find the user by their email
      const user = await db.models.user.findOne({ where: { email: userEmail } });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      let flagfirstName;
      let flaglastName;
      let flagpassword;
      // Update fields if provided
      if (firstName) {user.firstName = firstName} else{flagfirstName=0};
      if (lastName) {user.lastName = lastName;}else{flaglastName=0}
      
      // If password is provided, hash it before saving
      if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          user.password = hashedPassword;
      }
      else{
        flagpassword =0;
      }
      
      user.accountUpdated=new Date();

      await user.save();

      // Respond success without sensitive information
      if(flagfirstName==0 && flaglastName==0 && flagpassword==0){
        res.status(204).send("No Content")
      }
      else{
      res.status(200).json({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          accountCreated: user.accountCreated,
            accountUpdated: user.accountUpdated
      });}
    

  } catch (error) {
    console.error(error)
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


  app.get('/healthz', async (request, response) => {
    let client;
  
    try {
  
      if (request.body && Object.keys(request.body).length > 0 || request.query && Object.keys(request.query).length > 0) {
        response.status(400).send();
      } else {
        await dbPool.sequelize.authenticate();
        response.status(200).send();
      }
    } catch (error) {
      //database not available 
      response.status(503).send();
    } finally {
      if (client) {
        client.release();
      }
    }
  });
  
  app.all('/healthz', dbConnectionCheckMiddleware, async (request, response) => {
    
    try{
       await db.sequelize.authenticate();
      if (request.method == 'GET') {
      //If the url or endpoint entered is wrong
      response.status(404).send();
    }
    else {
      //If any other methods are used except GET
      response.status(405).send();
    }}
    catch (error) {
      console.error(error)
      //database not available 
      response.status(503).send();
    }
  });


  
  (async ()=> {
    try{
      await db.sequelize.authenticate();
      await db.sequelize.sync();
    console.log('Connection has been established successfully.');
    }catch (error) {
      console.error('Unable to connect to the database:', error);
    }
     


  })();
  const server =app.listen(port,() => {

    console.log(`Server Started at Port ${port}`) 
   
  })
  module.exports ={ app,server};


 
  
  
