
import bcrypt from 'bcrypt';
import basicAuth from 'basic-auth';
import  sequelize  from '../config/database.js';
import User from '../model/user.js';
import authenticate from '../middlewares/basicAuth.js';
import logger  from '../logger.js';
// import pubSub from '@google-cloud/pubsub';
import {PubSub} from "@google-cloud/pubsub"
import {formatISO,addMinutes} from "date-fns"

import dotenv from "dotenv";
import { use } from 'chai';
dotenv.config();
// const pubSubClient = new pubSub({
//     projectId:process.env.cloud_project
// })
const pubSubClient = new PubSub({
    projectId:`dev-cloud-415015`
})
function generateVerificationLink(userId, expiresTime) {
    return `https://udaygattu.me:8080/verify?userId=${userId}&expires=${encodeURIComponent(formatISO(expiresTime))}`;
  }

  function createMessagePayload(userId, username, firstName, lastName, expiresTime) {
    return JSON.stringify({
      userId,
      username,
      fullName: `${firstName} ${lastName}`,
      verificationLink: generateVerificationLink(userId, expiresTime)
    });
  }
  async function publishMessage(topicName, messageData) {
    const messageBuffer = Buffer.from(messageData);
    await pubSubClient.topic(topicName).publishMessage({ data: messageBuffer });
  }
  async function publishVerificationMessage(userId, username, firstName, lastName) {
    const expiresTime = addMinutes(new Date(), 2);
    const messageData = createMessagePayload(userId, username, firstName, lastName, expiresTime);
    
    try {
      await publishMessage('projects/dev-cloud-415015/topics/verify_email', messageData);
      logger.info(`Verification email message published for user ${username}`);
    } catch (error) {
      logger.error(`Failed to publish verification email message for user ${userId}`, error);
    }
  }
  const healthCheck = async (req, res) => {
    try {
      await sequelize.authenticate();
      
      logger.debug({
        severity: "DEBUG",
        message: "Trying to connect database",
      });
      logger.info({
        severity: "INFO",
        message: "Database connection successful",
      });
      res.status(200).send();
    } catch (error) {
      logger.error({
        severity: "ERROR",
        message: "Database connection failed",
      });
      res.status(503).send();
    }
  };
  
  const createUser = async (req, res) => {
    try {
        const { username, password, firstName, lastName } = req.body; 
    
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
          logger.warn({
            severity: 'WARN',
            message: 'Attempt to create a user that already exists'
          });
          return res.status(400).send('User already exists with this username.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
          username,
          password: hashedPassword,
          firstName, 
          lastName, 
          account_created: new Date(),
          account_updated: new Date()
        });
        await publishVerificationMessage(user.id, username , firstName, lastName);
        await user.update({ mailSentAt: new Date() });
  
        logger.info({
          severity: 'INFO',
          message: 'user created sucessfully'
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
         logger.error({
          severity: 'ERROR',
          message: 'User creation failed'
        });
        res.status(400).send('please enter valid details');
      }
  };
  const verifyUser = async (req, res) => {
    const { id, token } = req.query; // Use a token instead of an expiration time
  
    if (!id) {
      logger.warn('User ID is missing');
      return res.status(400).json({ message: 'User ID is missing.' });
    }
    if (!token) {
      logger.warn('Verification token is missing');
      return res.status(400).json({ message: 'Verification token is missing.' });
    }
  
  
  
    try {
      const user = await User.findByPk(id);
  
      if (!user) {
        logger.warn(`User not found during verification: ${id}`);
        return res.status(404).json({ message: 'User not found.' });
      }
      if (user.isEmailVerified) {
        logger.info(`User already verified: ${id}`);
        return res.status(400).json({ message: 'User already verified.' });
      }
  
      user.isEmailVerified = true;
      user.verificationToken = null; // Clear the token after verification
      await user.save();
  
      logger.info(`User email verified: ${id}`);
      res.status(200).json({ message: 'Email successfully verified.' });
    } catch (error) {
      logger.error('Email verification failed', error);
      res.status(500).json({ message: 'Failed to verify email.' });
    }
  };
  
  
  const verifyEmail = async (req, res) => {
    const { token } = req.query;
  
    if (!token) {
      return res.status(400).json({ message: 'Verification  is required.' });
    }
  
    try {
      const user = await User.findOne({
        where: { verificationToken: token }
      });
      const timestamp = user.mailSentAt;
  const currentTime = new Date();
  const difference = (currentTime - timestamp) / 1000 / 60; // Difference in minutes
  
  
  if (difference <= 2) {
   
      user.isEmailVerified = true;
      await user.save();
      return res.status(200).json({ message: 'Email successfully verified.' });
  } else {
     
      return res.status(400).json({ message: 'Verification link expired. Please request a new verification link.' });
  }
  
  
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ message: 'Internal server error during verification.' });
    }
  };
  
  
  const getUser = async (req, res) => {
    if (Object.keys(req.body).length != 0) {
      logger.warn({
        severity: "WARN",
        message: "request body must be empty",
      });
      return res.status(400).send("Request body must be empty.");
    }
  
    try {
      const basic = basicAuth(req);
      if (!basic || !basic.name) {
        logger.warn({
          severity: "WARN",
          message: "authentication credentials not provided",
        });
        return res.status(401).send("Authentication credentials not provided.");
      }
      const user = await User.findOne({ where: { username: basic.name } });
      if (user === null) {
        logger.warn({
          severity: "WARN",
          message: "unauthorised access attempt of user",
        });
        return res.status(401).send("Unauthorized user.");
      }
      if (!user) {
        logger.warn({
          severity: "WARN",
          message: "user not found",
        });
        return res.status(401).json({ message: "User not found" });
      }
  
      const verified = await bcrypt.compare(basic.pass, user.password);
      if (!verified) {
        logger.warn({
          severity: "WARN",
          message: `Get user failed: Invalid Credentials`,
        });
  
        return res.status(401).json({ message: "Invalid Credentials" });
      }
  
      // Check if the user's email has been verified
      if (!user.isEmailVerified) {
        logger.warn({
          severity: "WARN",
          message: `Access denied for unverified user: ${user.username}`,
        });
        return res
          .status(403)
          .json({
            message: "Please verify your email address to access this feature.",
          });
      }
  
      const auth = await authenticate(req, user);
      if (!auth) {
        logger.warn({
          severity: "WARN",
          message: "Authentication failed",
        });
        return res.status(401).send("Authentication failed.");
      }
  
      const userInfo = user.toJSON();
      delete userInfo.password;
      delete userInfo.isEmailVerified;
      delete userInfo.verificationLink;
      delete userInfo.mailSentAt;
      logger.info({
        severity: "INFO",
        message: "user authenticated successfully",
      });
      res.status(200).json(userInfo);
    } catch (error) {
      console.error(error);
      logger.error({
        severity: "ERROR",
        message: "error in getting user",
      });
      res.status(500).send("An error occurred during the process.");
    }
  };
  
  const updateUser = async (req, res) => {
    const { firstName, lastName, password, username } = req.body;
    if (!firstName && !lastName && !password) {
      logger.info({
        severity: "INFO",
        message: "attempt to update user",
      });
      return res.status(400).send();
    } else {
      try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
          logger.warn({
            severity: "WARN",
            message: "attempt to update username",
          });
          return res.status(400).send("Username cannot be updated.");
        }
        const auth = await authenticate(req, user);
        if (!user.isEmailVerified) {
          logger.warn({
            severity: "WARN",
            message: `Access denied for unverified user: ${user.username}`,
          });
          return res
            .status(403)
            .json({
              message: "Please verify your email address to access this feature.",
            });
        }
        if (!auth) {
          logger.warn({
            severity: "WARN",
            message: "unauthorised update attempt for user",
          });
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
          logger.info({
            severity: "INFO",
            message: "user details updated sucessfully",
          });
  
          return res.status(204).send("User updated successfully.");
        }
      } catch (error) {
        console.error(error);
        logger.error({
          severity: "ERROR",
          message: "error in updating user",
        });
        return res.status(400).json(error.message);
      }
    }
  };
  
  export { healthCheck, createUser, verifyUser,verifyEmail, updateUser, getUser };
  publishVerificationMessage("123", "Uday_Gattu", "Uday", "Gattu")
    .then(() => console.log("Message published successfully"))
    .catch(console.error);
  
