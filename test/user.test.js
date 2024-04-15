
import supertest from 'supertest';
import { expect } from 'chai';
import app from '../index.js';
import sequelize from '../config/database.js'; 
import User from '../model/user.js';
const request = supertest(app);


before(async () => {
  
  await sequelize.sync({ force: true });
  console.log('Database schema synchronized successfully.');
});

after(async () => {
  
  await sequelize.close();
  console.log('Database connection closed.');
});


describe('User API',  async function() {
  
  it('Test 1 - Create an account, and using the GET call, validate account exists', async function() {
    const userData = {
      username: 'test@example.com',
      password: 'Password123@',
      firstName: 'srinivas',
      lastName: 'varma'
    };

    
    const createResponse = await request.post('/v2/user').send(userData).expect(201);
    const createdUser = createResponse.body;

   
    
    const A = await User.update({isEmailVerified:true}, {where: { username:userData.username}})
    console.log(`logging: ${A}`)
   
    const getResponse = await request
      .get('/v2/user/self')
      .set('Authorization', `Basic ${Buffer.from(`${userData.username}:${userData.password}`).toString('base64')}`)
      .expect(200);

    const retrievedUser = getResponse.body;

  
    expect(retrievedUser.username).to.equal(createdUser.username);
    expect(retrievedUser.firstName).to.equal(createdUser.firstName);
    expect(retrievedUser.lastName).to.equal(createdUser.lastName);
  });

   it('Test 2 - Update the account and using the GET call, validate the account was updated', async function() {
    const userData = {
      username: 'test@example.com',
      password: 'Password123@',
      firstName: 'uday',
      lastName: 'gattu'
    };
    const userDataUpdate = {
        username: 'test@example.com',
        password: 'Password123@2344',
        firstName: 'nikhil',
        lastName: 'mamidi'
      };

      await request
      .put('/v2/user/self')
      .set('Authorization', 'Basic ' + Buffer.from(userData.username + ':' + userData.password).toString('base64'))
      .send(userDataUpdate)
      .expect(204);

      const updatedResponse = await request
      .get('/v2/user/self')
      .set('Authorization', 'Basic ' + Buffer.from(userDataUpdate.username + ':' + userDataUpdate.password).toString('base64'))
      .expect(200);

      const retrievedUser = updatedResponse.body;
      expect(userDataUpdate.firstName).to.deep.equal(retrievedUser.firstName);
      expect(userDataUpdate.lastName).to.deep.equal(retrievedUser.lastName);
  });
});  
