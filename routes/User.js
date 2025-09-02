import express from 'express';
import { createUser } from '../controllers/User.js';
import { Auth } from '../middleware/Auth.js';

const router = express.Router();

router.get('/:id', Auth, getUserById);

router.get('/', Auth, getAllUsers);

router.put('/:id', Auth, updateUser);

router.delete('/:id', Auth, deleteUser);

router.post('/', Auth, createUser);

export default router;
