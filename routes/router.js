import express from 'express';
const router = express.Router();
import { healthCheckMiddleware, methodNotAllowed } from '../middlewares/healthCheck.js'; 
import { healthCheck, createUser,verifyUser,verifyEmail, getUser, updateUser } from '../controllers/controllers.js'; 

router.get('/healthz', healthCheckMiddleware, healthCheck);
router.all('/healthz', healthCheckMiddleware, methodNotAllowed); 
router.post('/v2/user', createUser);
router.get('/v2/user/self', getUser);
router.put('/v2/user/self', updateUser);
router.get('/verify', verifyUser);
router.get('/v2/user/verify', verifyEmail);


export default router;

