

import express from 'express';

import { healthCheckMiddleware, methodNotAllowed } from '../middlewares/healthCheck.js';
import { healthCheck, createUser, getUser, updateUser,verifyEmail,verifyUser } from '../controllers/controllers.js';

const router = express.Router();


router.route('/healthz')
  .get(healthCheckMiddleware, healthCheck) 
  .all(healthCheckMiddleware, methodNotAllowed); 


router.post('/v1/user', createUser); 
router.route('/v1/user/self')
  .get(getUser) 
  .put(updateUser); 
router.get('/verify',verifyUser)
router.get('/v1/user/verify', verifyEmail)
export default router;
