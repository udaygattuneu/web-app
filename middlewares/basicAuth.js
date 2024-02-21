
import basicAuth from 'basic-auth';
import bcrypt from 'bcrypt';

const authenticate = async (req, user) => {
  const credentials = basicAuth(req); 
  console.log(credentials);
  const isValid = await isValidCredentials(credentials, user);
  return isValid; 
};

const isValidCredentials = async (credentials, user) => {
  console.log(user);
  
  if (credentials && user) {
    const match = await bcrypt.compare(credentials.pass, user.password);
    return credentials.name === user.username && match;
  }
  return false;
};


export default authenticate;
