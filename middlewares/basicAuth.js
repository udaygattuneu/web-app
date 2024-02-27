
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

