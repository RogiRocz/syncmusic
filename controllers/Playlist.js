import { StatusCodes } from 'http-status-codes';
import {
    createPlaylist as createPlaylistService,
    deletePlaylist as deletePlaylistService,
    getAllPlaylists as getAllPlaylistsService,
    getPlaylistById as getPlaylistByIdService,
    addTrackToPlaylist as addTrackToPlaylistService,
    getPlaylistTracks as getPlaylistTracksService,
    replacePlaylist as replacePlaylistService,
    updatePlaylist as updatePlaylistService,
    updateSyncStatus as updateSyncStatusService,
    removeTrackFromPlaylist as removeTrackFromPlaylistService,
    getPlaylists as getPlaylistsService,
} from '../services/Playlist.js';
import {
    validatePlaylist,
    validatePlaylistUpdate,
} from '../models/Playlist.js';
import Logger from '../logs/Logger.js';

const createPlaylist = async (req, res) => {
    try {
        const validatedData = await validatePlaylist(req.body);
        const newPlaylist = await createPlaylistService(validatedData);
        return res.status(StatusCodes.CREATED).json(newPlaylist);
    } catch (error) {
        Logger.error(`Error in createPlaylist controller: ${error.message}`, { stack: error.stack });
        if (error.message.includes('validation')) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: `Validation Error: ${error.message}` });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const addTrackToPlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const trackData = req.body;
        const updatedPlaylist = await addTrackToPlaylistService(id, trackData);
        return res.status(StatusCodes.OK).json(updatedPlaylist);
    } catch (error) {
        Logger.error(`Error in addTrackToPlaylist controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }

};

const getPlaylists = async (req, res) => {
    try {
        const query = req.query ? req.query : {};
        query.ownerId = req.user.uid;

        const playlists = await getPlaylistsService(query);

        return res.status(StatusCodes.OK).json(playlists);
    } catch (error) {
        Logger.error(`Error in getPlaylists controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
}

const getPlaylistById = async (req, res) => {
    try {
        const playlist = await getPlaylistByIdService(req.params.id);
        if (!playlist) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: `Playlist not found` });
        }
        return res.status(StatusCodes.OK).json(playlist);
    } catch (error) {
        Logger.error(`Error in getPlaylistById controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const getPlaylistSyncStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const playlist = await getPlaylistByIdService(id);
        if (!playlist) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: `Playlist not found` });
        }
        return res.status(StatusCodes.OK).json(playlist.syncStatus);
    } catch (error) {
        Logger.error(`Error in getPlaylistSyncStatus controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
}

const getPlaylistTracks = async (req, res) => {
    try {
        const tracks = await getPlaylistTracksService(req.params.id);
        return res.status(StatusCodes.OK).json(tracks);
    } catch (error) {
        Logger.error(`Error in getPlaylistTracks controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const replacePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = await validatePlaylist(req.body);
        const updatedPlaylist = await replacePlaylistService(id, validatedData);
        return res.status(StatusCodes.OK).json(updatedPlaylist);
    } catch (error) {
        Logger.error(`Error in replacePlaylist controller: ${error.message}`, { stack: error.stack });
        if (error.message.includes('validation')) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation Error', details: error.message });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const updatePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = await validatePlaylistUpdate(req.body);
        const updatedPlaylist = await updatePlaylistService(id, validatedData);
        return res.status(StatusCodes.OK).json(updatedPlaylist);
    } catch (error) {
        Logger.error(`Error in updatePlaylist controller: ${error.message}`, { stack: error.stack });
        if (error.message.includes('validation')) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation Error', details: error.message });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const updateSyncStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { syncStatus } = req.body;
        const updatedPlaylist = await updateSyncStatusService(id, syncStatus);
        return res.status(StatusCodes.OK).json(updatedPlaylist);
    } catch (error) {
        Logger.error(`Error in updateSyncStatus controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const deletePlaylist = async (req, res) => {
    try {
        const tracks = await getPlaylistTracksService(req.params.id);
        for (const track of tracks) {
            await removeTrackFromPlaylistService(req.params.id, track.id);
        }
        
        await deletePlaylistService(req.params.id);
        return res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        Logger.error(`Error in deletePlaylist controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const removeTrackFromPlaylist = async (req, res) => {
    try {
        const { id, trackId } = req.params;
        await removeTrackFromPlaylistService(id, trackId);
        return res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        Logger.error(`Error in removeTrackFromPlaylist controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const getAllPlaylists = async (req, res) => {
    try {
        const { pageSize, cursor } = req.query;
        const playlists = await getAllPlaylistsService(pageSize, cursor);
        return res.status(StatusCodes.OK).json(playlists);
    } catch (error) {
        Logger.error(`Error in getAllPlaylists controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

export {
    createPlaylist,
    addTrackToPlaylist,
    getPlaylists,
    getPlaylistById,
    getPlaylistTracks,
    replacePlaylist,
    updatePlaylist,
    updateSyncStatus,
    deletePlaylist,
    removeTrackFromPlaylist,
    getAllPlaylists,
    getPlaylistSyncStatus,
};
