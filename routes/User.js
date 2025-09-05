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
import {isAuthenticaded, hasRole} from '../middleware/Auth.js'
import {checkOwnership} from '../middleware/checkOwnership.js'

const router = express.Router();
router.use(isAuthenticaded)

router.post('/', createUser);

router.get('/:id', checkOwnership, getUserById);
router.get('/:id/tokens', checkOwnership, getUserTokens);
router.get('/:id/preferences', checkOwnership, getUserPreferences);
router.get('/:id/playlists', checkOwnership, getUserPlaylists);


router.put('/:id', checkOwnership, replaceUser);
router.patch('/:id', checkOwnership, updateUser);
router.patch('/:id/tokens/:plataformName', checkOwnership, upsertToken);
router.patch('/:id', checkOwnership, updatePreferences);

router.delete('/:id', checkOwnership, deleteUser);

// As rotas abaixo são apenas para administradores
router.get('/', hasRole('admin'), getAllUsers);

export default router;
