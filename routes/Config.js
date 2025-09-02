import express from 'express';
import { getFirebaseClientConfig } from '../controllers/Config.js';

const router = express.Router();

router.get('/firebase-client', getFirebaseClientConfig);

export default router;
