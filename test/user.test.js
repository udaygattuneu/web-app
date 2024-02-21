
import supertest from 'supertest';
import { expect } from 'chai';
import app from '../api.js';
import sequelize from '../config/sequelize.js'; 

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
      username: 'test5@example.com',
      password: 'Password123@',
      firstName: 'John',
      lastName: 'Doe'
    };

    
    const createResponse = await request.post('/v1/user').send(userData).expect(201);
    const createdUser = createResponse.body;

   
    

   
    const getResponse = await request
      .get('/v1/user/self')
      .set('Authorization', `Basic ${Buffer.from(`${userData.username}:${userData.password}`).toString('base64')}`)
      .expect(200);

    const retrievedUser = getResponse.body;

  
    expect(retrievedUser.username).to.equal(createdUser.username);
    expect(retrievedUser.firstName).to.equal(createdUser.firstName);
    expect(retrievedUser.lastName).to.equal(createdUser.lastName);
  });

   it('Test 2 - Update the account and using the GET call, validate the account was updated', async function() {
    const userData = {
      username: 'test5@example.com',
      password: 'Password123@',
      firstName: 'John',
      lastName: 'Doe'
    };
    const userDataUpdate = {
        username: 'test5@example.com',
        password: 'Password123@2344',
        firstName: 'JohnDa4',
        lastName: 'Doe'
      };

      const createResponse = await request
      .put('/v1/user/self')
      .set('Authorization', 'Basic ' + Buffer.from(userData.username + ':' + userData.password).toString('base64'))
      .send(userDataUpdate)
      .expect(204);

      const updatedResponse = await request
      .get('/v1/user/self')
      .set('Authorization', 'Basic ' + Buffer.from(userDataUpdate.username + ':' + userDataUpdate.password).toString('base64'))
      .expect(200);

      const retrievedUser = updatedResponse.body;
      expect(userDataUpdate.firstName).to.deep.equal(retrievedUser.firstName);
      expect(userDataUpdate.lastName).to.deep.equal(retrievedUser.lastName);
  });
});  
