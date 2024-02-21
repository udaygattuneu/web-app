

import bcrypt from 'bcrypt';
import basicAuth from 'basic-auth';
import sequelize  from '../config/sequelize.js'; 
import User from '../model/user.js'; 
import authenticate from '../middlewares/basicAuth.js'; 

const healthCheck = async (req, res) => {
    try {
        await sequelize.authenticate();
        res.status(200).send();
    } catch (error) {
        res.status(503).send();
    }
};

const createUser = async (req, res) => {
  try {
      const { username, password, firstName, lastName } = req.body;
      console.log(username);
      const existingUser = await User.findOne({ where: { username } });
      
      if (existingUser) {
        return res.status(400).send('User already exists with this username.');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(hashedPassword);
      const user = await User.create({
        username,
        password: hashedPassword,
        firstName,
        lastName,
        account_created: new Date(),
        account_updated: new Date()
      });
      res.status(201).json({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        accountCreated: user.account_created,
        accountUpdated: user.account_updated
      });
    } catch (error) {
      console.error(error);
      res.status(400).send('Please enter valid details');
    }
};

const getUser = async (req, res) => {
  if (Object.keys(req.body).length != 0) {
    return res.status(400).send("Request body must be empty.");
  }

  try {
    const basic = basicAuth(req); 
    if (!basic || !basic.name) {
      return res.status(401).send("Authentication credentials not provided.");
    }

    const user = await User.findOne({ where: { username: basic.name } });
    if (user === null) {
      return res.status(401).send("Unauthorized user.");
    }

    const auth = await authenticate(req, user); 
    if (!auth) {
      return res.status(401).send("Authentication failed.");
    }

    const userInfo = user.toJSON();
    delete userInfo.password; 
    res.status(200).json(userInfo); 
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred during the process.");
  }
};

const updateUser = async (req, res) => {
  const { firstName, lastName, password, username } = req.body;
  if (!firstName && !lastName && !password) {
    return res.status(400).send(); 
  } else {  
    try {  
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).send('Username cannot be updated.');
        }
        const auth = await authenticate(req, user);
        if (!auth) {
            return res.status(401).send("Unauthorized User");
        } else {
          if (firstName) user.firstName = firstName;
          if (lastName) user.lastName = lastName;
          if (password) {
              const hashedPassword = await bcrypt.hash(password, 10);
              user.password = hashedPassword;
          }
          user.account_updated = new Date();
          await user.save();

          return res.status(204).send('User updated successfully.');
        }       
    } catch (error) {
        console.error(error);
        return res.status(400).json(error.message);
    }
  }
};


export { healthCheck, createUser, updateUser, getUser };
