
import bcrypt from 'bcrypt';
import basicAuth from 'basic-auth';
import  sequelize  from '../config/database.js';
import User from '../model/user.js';
import authenticateUser from '../middlewares/basicAuth.js';
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
    return `https://udaygattu.me:5002/verify?userId=${userId}&expires=${encodeURIComponent(formatISO(expiresTime))}`;
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
const healthCheck = async(req,res)=>{
    try {
        await sequelize.authenticate();
        logger.debug({
            severity: "DEBUG",
            message: "Trying to connect database",
          });
        logger.info({
            severity: 'INFO',
            message: 'Database sucessfully connected'
          });
        res.sendStatus(200).send();
    } catch (error) {
        logger.error({
            severity: 'ERROR',
            message: 'Database Connection failed'
          });
        res.sendStatus(503).send();
    }
}
// 
const registerUser = async(req,res)=>{

    const { username, password, firstName, lastName } = req.body;

    try {
        const userExists = await User.findOne({ where: { username } });
        if (userExists){ 
            logger.warn({
                severity: 'WARN',
                message: 'Attempt to create a user that already exists'
              });
            return res.status(400).send('User already exists.');}

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            password: hashedPassword,
            firstName,
            lastName,
            account_created: new Date(),
            account_updated: new Date(),
        });
        await publishVerificationMessage(newUser.id, username , firstName, lastName);
        await newUser.update({ mailSentAt: new Date() });
        logger.info({
            severity: 'INFO',
            message: 'sucessfully user created'
          });
        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            accountCreated: newUser.account_created,
            accountUpdated: newUser.account_updated,
        });
    } catch (error) {
        logger.warn({
            severity: 'WARN',
            message: 'Invalid details provided'
          });
        res.status(400).send('Invalid details provided.');
    }
}

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
  
    //const timestamp=User.mailSentAt;
    //const currenttime= new Date();
    //const differnece=(currenttime-new Date(timestamp))
    //if(differnece>2) return res.status(400).json({message:'verified'})
  
  
    try {
      const user = await User.findByPk(id);
  
      if (!user) {
        logger.warn(`User not found during verification: ${id}`);
        return res.status(404).json({ message: 'User not found.' });
      }
  
      if (user.verificationToken !== token || new Date() > user.tokenExpires) {
        return res.status(400).json({ message: 'Invalid or expired verification token.' });
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
      return res.status(400).json({ message: 'Verification token is required.' });
    }
  
    try {
      const user = await User.findOne({
        where: { verificationToken: token }
      });
      const timestamp=user.mailSentAt;
    const currenttime= new Date();
    const differnece=(currenttime-new Date(timestamp))
    if(differnece>2) 
    {
      user.isEmailVerified = true;
      await user.save();
      return res.status(400).json({message:'verified'})
      
    }
  
    else{
      user.isEmailVerified = false;
      await user.save();
        return res.status(404).json({ message: 'Invalid or expired verification token.' });
      }
  
  
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ message: 'Internal server error during verification.' });
    }
  };

const fetchUser =async(req,res)=>{
    if (Object.keys(req.body).length !== 0) {
        logger.warn({
            severity: 'WARN',
            message: 'request body must be empty'
          });
        return res.status(400).send("Request body must be empty.");}

    const credentials = basicAuth(req);
    if (!credentials) {
        logger.warn({
            severity: 'WARN',
            message: 'Authentication required.'
          });
        return res.status(401).send("Authentication required.");}

    try {
        const user = await User.findOne({ where: { username: credentials.name } });
        if (user === null) {
          logger.warn({
            severity: "WARN",
            message: "unauthorised access attempt of user",
          });
          return res.status(401).send("Unauthorized user.");
        }
        if (!user) {
            logger.warn({
                severity: 'WARN',
                message: 'Unauthorized access.'
              });
            return res.status(401).send("Unauthorized access.");}
        
        const verified = await bcrypt.compare(credentials.pass,user.password);
        if(!verified){
            logger.warn({
                severity:"WARN",
                message:`Get user failed: Invalid Credentials`,
            });
            return res.status(401).json({message:'Invalid Credentials'})
        }
        if(!user.isEmailVerified){
            logger.warn({
                severity:"WARN",
                message:`Access denied for unverified user: ${user.username}`
            });
            return res.status(403).json({
                message:`please verify your email address to access this feature.`
            })
        }

        const authenticated = await authenticateUser(req, user);
        if (!authenticated) {
            logger.warn({
                severity: 'WARN',
                message: 'Invalid credentials'
              });
            return res.status(401).send("Invalid credentials.");}
        

        const { password, ...userInfo } = user.toJSON();
        logger.info({
            severity: 'INFO',
            message: 'user sucessfully fetched'
          });
        res.json(userInfo);
    } catch (error) {
      console.log(error,"1111111111")
        logger.error({
            severity: 'ERROR',
            message: 'error in processing requests'
          });
        res.status(500).send("Error processing request.");
    }
}
const modifyUser = async(req,res)=>{

    const { firstName, lastName, password, username } = req.body;

    if (!firstName && !lastName && !password) {
        logger.warn({
            severity: 'WARN',
            message: 'No update parameters provided'
          });
        return res.status(400).send("No update parameters provided.");}

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            logger.warn({
                severity: 'WARN',
                message: 'Cannot change username'
              });
            return res.status(400).send('Cannot change username.');}

        const authenticated = await authenticateUser(req, user);
        if(!user.isEmailVerified){
            logger.warn({
                severity:"WARN",
                message:`Access denied for unverified user ${user.username}`
            })
            return res
                .status(403)
                .json({
                    message: 'please verify your email address to access this feature'
                })
        }
        if (!authenticated) {
            logger.warn({
                severity: 'WARN',
                message: 'Unauthorized access'
              });
            return res.status(401).send("Unauthorized access.");}

        await User.update({
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            password: password ? await bcrypt.hash(password, 10) : user.password,
            account_updated: new Date(),
        }, {
            where: { username },
        });
        logger.info({
            severity: 'INFO',
            message: 'update successful'
          });
        res.status(204).send('Update successful.');
    } catch (error) {
      console.error('Error updating user:', error);
        logger.warn({
            severity: 'WARN',
            message: 'error updating user'
          });
        res.status(400).send('Error updating user.');
    }
}



export {  healthCheck , registerUser as createUser, fetchUser as getUser, modifyUser as updateUser,verifyEmail,verifyUser };
publishVerificationMessage('123',"uday_gattu","uday","gattu")
    .then(()=> console.log("message showed"))
    .catch(console.error)

