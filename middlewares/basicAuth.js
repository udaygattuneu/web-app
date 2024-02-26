
// import basicAuth from 'basic-auth';
// import bcrypt from 'bcrypt';

// const authenticate = async (req, user) => {
//   const credentials = basicAuth(req); 
//   console.log(credentials);
//   const isValid = await isValidCredentials(credentials, user);
//   return isValid; 
// };

// const isValidCredentials = async (credentials, user) => {
//   console.log(user);
  
//   if (credentials && user) {
//     const match = await bcrypt.compare(credentials.pass, user.password);
//     return credentials.name === user.username && match;
//   }
//   return false;
// };


// export default authenticate;

import basicAuth from 'basic-auth';
import bcrypt from 'bcrypt';


const authenticateUser = async (request, user) => {
  const credentials = basicAuth(request);
  if (!credentials || !user) return false;

  return await checkCredentials(credentials, user);
};

const checkCredentials = async ({ name, pass }, user) => {
  const passwordMatches = await bcrypt.compare(pass, user.password);
  return name === user.username && passwordMatches;
};

export default authenticateUser;
// 