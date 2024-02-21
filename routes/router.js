import express from 'express';
const router = express.Router();
import {healthCheckMiddleware, methodNotAllowed} from '../middlewares/healthCheck.js';
import { healthCheck, createUser, getUser, updateUser } from '../controllers/controllers.js'; 


router.get('/healthz', healthCheckMiddleware, healthCheck);
router.all('/healthz', healthCheckMiddleware, methodNotAllowed); 
router.post('/v1/user', createUser);
router.get('/v1/user/self', getUser);
router.put('/v1/user/self', updateUser);

export default router;