import { Router } from 'express';
import {
    createTrack,
    deleteTrack,
    getAllTracks,
    getTrackById,
    updateTrack,
} from '../controllers/Track.js';
import { checkOwnership } from '../middlewares/checkOwnership.js';


const router = Router();


// POST
router.post('/', checkOwnership, createTrack);

// GET
router.get('/', checkOwnership, getAllTracks);
router.get('/:id', checkOwnership, getTrackById);

// PATCH
router.patch('/:id', checkOwnership, updateTrack);

// DELETE
router.delete('/:id', checkOwnership, deleteTrack);

export default router;
