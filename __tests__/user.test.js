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
