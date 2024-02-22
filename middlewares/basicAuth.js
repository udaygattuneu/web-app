
import basicAuth from 'basic-auth';
import bcrypt from 'bcrypt';

const authenticate = async (req, User) => {
  const credentials = basicAuth(req); 
  console.log(credentials);
  const isValid = await isValidCredentials(credentials, User);
  return isValid; 
};

const isValidCredentials = async (credentials, User) => {
  console.log(User);
  
  if (credentials && User) {
    const match = await bcrypt.compare(credentials.pass, User.password);
    return credentials.name === User.username && match;
  }
  return false;
};


export default authenticate;