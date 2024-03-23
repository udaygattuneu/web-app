
import bcrypt from 'bcrypt';
import basicAuth from 'basic-auth';
import  sequelize  from '../config/database.js';
import User from '../model/user.js';
import authenticateUser from '../middlewares/basicAuth.js';
import logger  from '../logger.js';
async function healthCheck(req, res) {
    try {
        await sequelize.authenticate();
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
async function registerUser(req, res) {
    const { username, password, firstName, lastName } = req.body;

    try {
        const userExists = await User.findOne({ where: { username } });
        if (userExists) return res.status(400).send('User already exists.');

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            password: hashedPassword,
            firstName,
            lastName,
            account_created: new Date(),
            account_updated: new Date(),
        });
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

async function fetchUser(req, res) {
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
        if (!user) {
            logger.warn({
                severity: 'WARN',
                message: 'Unauthorized access.'
              });
            return res.status(401).send("Unauthorized access.");}

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
        logger.error({
            severity: 'ERROR',
            message: 'error in processing requests'
          });
        res.status(500).send("Error processing request.");
    }
}

async function modifyUser(req, res) {
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
        logger.warn({
            severity: 'WARN',
            message: 'error updating user'
          });
        res.status(400).send('Error updating user.');
    }
}



export {  healthCheck , registerUser as createUser, fetchUser as getUser, modifyUser as updateUser };

