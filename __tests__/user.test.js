const supertest = require('supertest');
const {app,server} = require('../src/api'); 
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
  // it('should connect to the database successfully', async () => {
  //   // This test assumes there's an endpoint `/v1/db-status` that checks database connectivity
  //   // You should replace this with an actual endpoint that can verify DB connection in your application
  //   const response = await request.get('/healthz');

  //   // The expected response and status code might vary based on your implementation
  //   // Here, we assume a 200 status code and a specific property in the body for demonstration
  //   expect(response.status).toBe(200);
  //   expect(response.body).toHaveProperty('message', 'Connected to the database successfully');

  //   // Alternatively, if directly querying the database in this test, ensure the query executes without errors
  //   // This might require setting up a direct database connection in the test, which should be closed afterward
  // });
  
 

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

  afterAll((done)=>{
    server.close(()=>{
      console.log("server closed");
      done();
    })
  })

});
