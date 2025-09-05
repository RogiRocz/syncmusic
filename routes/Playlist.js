import { Router } from 'express';
import {
    createPlaylist,
    addTrackToPlaylist,
    getPlaylists,
    getPlaylistById,
    getPlaylistTracks,
    getPlaylistSyncStatus,
    replacePlaylist,
    updatePlaylist,
    updateSyncStatus,
    deletePlaylist,
    removeTrackFromPlaylist,
    getAllPlaylists
} from '../controllers/Playlist.js';
import checkOwnership from '../middleware/checkOwnership.js';
import { hasRole } from '../middleware/Auth.js';

const router = Router();

// POST
router.post('/', createPlaylist);
router.post('/:id/tracks', checkOwnership, addTrackToPlaylist);

// GET
router.get('/', checkOwnership, getPlaylists);
router.get('/:id', checkOwnership, getPlaylistById);
router.get('/:id/tracks', checkOwnership, getPlaylistTracks);
router.get(':id/sync-status', checkOwnership, getPlaylistSyncStatus);

// PUT & PATCH
router.put('/:id', checkOwnership, replacePlaylist);
router.patch('/:id', checkOwnership, updatePlaylist);
router.patch('/:id/sync-status', checkOwnership, updateSyncStatus);

// DELETE
router.delete('/:id', checkOwnership, deletePlaylist);
router.delete('/:id/tracks/:trackId', checkOwnership, removeTrackFromPlaylist);

// ADMIN ROUTES
router.get('/all', hasRole('admin'), getAllPlaylists);

export default router;
