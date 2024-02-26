
import bcrypt from 'bcrypt';
import basicAuth from 'basic-auth';
import  sequelize  from '../config/database.js';
import User from '../model/user.js';
import authenticateUser from '../middlewares/basicAuth.js';

async function healthCheck(req, res) {
    try {
        await sequelize.authenticate();
        res.sendStatus(200).send();
    } catch (error) {
        res.sendStatus(503).send();
    }
}

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

        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            accountCreated: newUser.account_created,
            accountUpdated: newUser.account_updated,
        });
    } catch (error) {
        res.status(400).send('Invalid details provided.');
    }
}

async function fetchUser(req, res) {
    if (Object.keys(req.body).length !== 0) return res.status(400).send("Request body must be empty.");

    const credentials = basicAuth(req);
    if (!credentials) return res.status(401).send("Authentication required.");

    try {
        const user = await User.findOne({ where: { username: credentials.name } });
        if (!user) return res.status(401).send("Unauthorized access.");

        const authenticated = await authenticateUser(req, user);
        if (!authenticated) return res.status(401).send("Invalid credentials.");

        const { password, ...userInfo } = user.toJSON();
        res.json(userInfo);
    } catch (error) {
        res.status(500).send("Error processing request.");
    }
}

async function modifyUser(req, res) {
    const { firstName, lastName, password, username } = req.body;

    if (!firstName && !lastName && !password) return res.status(400).send("No update parameters provided.");

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(400).send('Cannot change username.');

        const authenticated = await authenticateUser(req, user);
        if (!authenticated) return res.status(401).send("Unauthorized access.");

        await User.update({
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            password: password ? await bcrypt.hash(password, 10) : user.password,
            account_updated: new Date(),
        }, {
            where: { username },
        });

        res.status(204).send('Update successful.');
    } catch (error) {
        res.status(400).send('Error updating user.');
    }
}



export {  healthCheck , registerUser as createUser, fetchUser as getUser, modifyUser as updateUser };

