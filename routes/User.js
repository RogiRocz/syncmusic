import express from 'express';
import {
    createUser, 
    deleteUser,
    getAllUsers,
    getUserById, 
    getUserTokens,
    getUserPreferences, 
    updateUser, 
    upsertToken,
    replaceUser,
    updatePreferences,
    getUserPlaylists
} from '../controllers/User.js';
import { Auth } from '../middleware/Auth.js';

const router = express.Router();

router.post('/', Auth, createUser);

router.get('/:id', Auth, getUserById);
router.get('/:id/tokens', Auth, getUserTokens);
router.get('/:id/preferences', Auth, getUserPreferences);
router.get('/:id/playlists', Auth, getUserPlaylists);


router.patch('/:id', Auth, updateUser);
router.patch('/:id/tokens/:plataformName', Auth, upsertToken);
router.put('/:id', Auth, replaceUser);
router.patch('/:id', Auth, updatePreferences);

// As rotas abaixo são apenas para administradores
router.delete('/:id', Auth, deleteUser);
router.get('/', Auth, getAllUsers);

export default router;
