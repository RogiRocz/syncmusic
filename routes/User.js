import express from 'express';
import { createUser } from '../controllers/User.js';
import { Auth } from '../middleware/Auth.js';

const router = express.Router();

router.post('/', Auth, createUser);

export default router;
