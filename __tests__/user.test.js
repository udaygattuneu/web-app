// const supertest = require('supertest');
// const {app,server} = require('../src/api'); 
// const request = supertest(app);





// describe('User API Integration Tests with Basic Authentication', () => {
//   const uniqueTimeStamp = Date.now();
//   const userData = {
//     email: `testuser${uniqueTimeStamp}@example.com`,
//     password: 'Test1234!',
//     firstName: 'Test',
//     lastName: 'User'
//   };

//   const encodedCredentials = Buffer.from(`${userData.email}:${userData.password}`).toString('base64');

 

//   it('should create a user successfully', async () => {
//     const response = await request.post('/v1/user').send(userData);
//     expect(response.status).toBe(201);
//     expect(response.body).toHaveProperty('email', userData.email);
//   });

//   it('should fetch the created user successfully using basic auth', async () => {
//     const response = await request
//       .get(`/v1/user/self`)
//       .set('Authorization', `Basic ${encodedCredentials}`);
    
//     expect(response.status).toBe(200);
//     expect(response.body.email).toBe(userData.email);
//   });

//   it('should update the created user successfully using basic auth', async () => {
//     const updateData = {
//       firstName: 'UpdatedName',
//       lastName: 'UpdatedLastName'
//     };

//     const response = await request
//       .put(`/v1/user/self`)
//       .set('Authorization', `Basic ${encodedCredentials}`)
//       .send(updateData);
    
//     expect(response.status).toBe(200);
//     expect(response.body.firstName).toEqual(updateData.firstName);
//     expect(response.body.lastName).toEqual(updateData.lastName);
//   });

//   afterAll((done)=>{
//     server.close(()=>{
//       console.log("server closed");
//       done();
//     })
//   })

// });


// const supertest = require('supertest');
// const { app, server } = require('../src/api');
// const request = supertest(app);



// describe('User API Integration Tests with Basic Authentication', () => {
//   const uniqueTimeStamp = Date.now();
//   const userData = {
//     email: `testuser${uniqueTimeStamp}@example.com`,
//     password: 'Test1234!',
//     firstName: 'Test',
//     lastName: 'User'
//   };

//   const encodedCredentials = Buffer.from(`${userData.email}:${userData.password}`).toString('base64');


//   it('should create a user successfully', async () => {
//     console.log('Creating a user');
//     const response = await request.post('/v1/user').send(userData);
//     expect(response.status).toBe(201);
//     expect(response.body).toHaveProperty('email', userData.email);
//     console.log('User created successfully');
//   });

//   it('should fetch the created user successfully using basic auth', async () => {
//     console.log('Fetching the created user');
//     const response = await request
//       .get(`/v1/user/self`)
//       .set('Authorization', `Basic ${encodedCredentials}`);

//     expect(response.status).toBe(200);
//     expect(response.body.email).toBe(userData.email);
//     console.log('User fetched successfully');
//   });

//   it('should update the created user successfully using basic auth', async () => {
//     console.log('Updating the created user');
//     const updateData = {
//       firstName: 'UpdatedName',
//       lastName: 'UpdatedLastName'
//     };

//     const response = await request
//       .put(`/v1/user/self`)
//       .set('Authorization', `Basic ${encodedCredentials}`)
//       .send(updateData);

//     expect(response.status).toBe(200);
//     expect(response.body.firstName).toEqual(updateData.firstName);
//     expect(response.body.lastName).toEqual(updateData.lastName);
//     console.log('User updated successfully');
//   });

//   afterAll((done) => {
//     console.log('All tests completed, shutting down the server');
//     server.close(() => {
//       console.log("Server closed");
//       done();
//     });
//   });
// });

// 
const supertest = require('supertest');
const mysql = require('mysql2/promise'); // Ensure mysql2 is installed for this
const { app, server } = require('../src/api');
const request = supertest(app);

describe('User API Integration Tests with Basic Authentication', () => {
  const uniqueTimeStamp = Date.now();
  const userData = {
    email: `testuser${uniqueTimeStamp}@example.com`,
    password: 'Test1234!',
    firstName: 'Test',
    lastName: 'User'
  };

  const encodedCredentials = Buffer.from(`${userData.email}:${userData.password}`).toString('base64');

  beforeAll(async () => {
    console.log('Setting up test environment, including database cleanup');
    
    // Database setup: Ensure these values are set in your GitHub Actions workflow environment or use a .env file for local testing
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Example cleanup query - adjust according to your schema and needs
    await connection.query('DELETE FROM users WHERE email LIKE "testuser%"');
    await connection.end();

    // Additional setup steps if necessary
  });

  it('should create a user successfully', async () => {
    const response = await request.post('/v1/user').send(userData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('email', userData.email);
  });

  it('should fetch the created user successfully using basic auth', async () => {
    const response = await request
      .get(`/v1/user/self`)
      .set('Authorization', `Basic ${encodedCredentials}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(userData.email);
  });

  it('should update the created user successfully using basic auth', async () => {
    const updateData = {
      firstName: 'UpdatedName',
      lastName: 'UpdatedLastName'
    };

    const response = await request
      .put(`/v1/user/self`)
      .set('Authorization', `Basic ${encodedCredentials}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.firstName).toEqual(updateData.firstName);
    expect(response.body.lastName).toEqual(updateData.lastName);
  });

  afterAll((done) => {
    console.log('Cleaning up after tests, shutting down the server');
    server.close(() => {
      console.log("Server closed");
      done();
    });
  });
});
