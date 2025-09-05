import { StatusCodes } from 'http-status-codes';
import {
    createUser as createUserService,
    deleteUser as deleteUserService,
    getAllUsers as getAllUsersService,
    getUserById as getUserByIdService,
    getUserTokens as getUserTokensService,
    getUserPreferences as getUserPreferencesService,
    updateUser as updateUserService,
    updateUserPreferences as updateUserPreferencesService,
    upsertAccessToken as upsertAccessTokenService,
    replaceUser as replaceUserService
} from '../services/User.js';
import {
    validateUserCreation,
    validateUserUpdate,
    validateTokenData,
    validateReplaceUser,
    validateUserPreferences
} from '../models/User.js';
import Logger from '../logs/Logger.js';
import {
    getPlaylistById as getPlaylistByIdService,
    deletePlaylist as deletePlaylistService
} from '../services/Playlist.js';
import {
    getTrackById as getTrackByIdService,
    deleteTrack as deleteTrackService
} from '../services/Track.js';

// --- Controllers ---

const updatePreferences = async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = await validateUserPreferences(req.body);
        const updatedPreferences = await updateUserPreferencesService(id, validatedData);

        return res.status(StatusCodes.OK).json(updatedPreferences);
    } catch (error) {
        Logger.error(`Error in updatePreferences controller: ${error.message}`, { stack: error.stack });
        if (error.message.includes('validation')) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation Error', details: error.message });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
}

const replaceUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (await getUserByIdService(id) == null) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }

        const validatedData = await validateReplaceUser(req.body);
        const updatedUser = await replaceUserService(id, validatedData);

        return res.status(StatusCodes.OK).json(updatedUser);
    } catch (error) {
        Logger.error(`Error in replaceUser controller: ${error.message}`, { stack: error.stack });
        if (error.message.includes('validation')) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation Error', details: error.message });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
}

const upsertToken = async (req, res) => {
    try {
        const { id, plataformName } = req.params;
        const validatedTokenData = await validateTokenData(req.body);
        const newOrUpdatedToken = await upsertAccessTokenService(id, plataformName, validatedTokenData);

        return res.status(StatusCodes.OK).json(newOrUpdatedToken);
    } catch (error) {
        Logger.error(`Error in upsertToken controller: ${error.message}`, { stack: error.stack });
        if (error.message.includes('validation')) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation Error', details: error.message });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const createUser = async (req, res) => {
    try {
        const initialUserData = { id: req.user.uid, email: req.user.email };
        const validatedUserData = await validateUserCreation(initialUserData);

        if (await getUserByIdService(validatedUserData.id)) {
            return res.status(StatusCodes.CONFLICT).json({ message: 'User already exists' });
        }

        const newUser = await createUserService(validatedUserData);
        return res.status(StatusCodes.CREATED).json(newUser);
    } catch (error) {
        Logger.error(`Error in createUser controller: ${error.message}`, { stack: error.stack });
        if (error.message.includes('validation')) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: `Validation Error: ${error.message}` });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = await validateUserUpdate(req.body);
        const updatedUser = await updateUserService(id, validatedData);

        if (!updatedUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: `User with ID ${id} not found` });
        }

        return res.status(StatusCodes.OK).json(updatedUser);
    } catch (error) {
        Logger.error(`Error in updateUser controller: ${error.message}`, { stack: error.stack });
        if (error.message.includes('validation')) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation Error', details: error.message });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await getUserByIdService(req.params.id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: `User not found` });
        }
        return res.status(StatusCodes.OK).json(user);
    } catch (error) {
        Logger.error(`Error in getUserById controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const getUserTokens = async (req, res) => {
    try {
        const tokens = await getUserTokensService(req.params.id);
        return res.status(StatusCodes.OK).json(tokens);
    } catch (error) {
        Logger.error(`Error in getUserTokens controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const getUserPreferences = async (req, res) => {
    try {
        const preferences = await getUserPreferencesService(req.params.id);
        return res.status(StatusCodes.OK).json(preferences);
    } catch (error) {
        Logger.error(`Error in getUserPreferences controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        if (!checkAdmin(req, res)) return;

        const { pageSize, cursor } = req.query;
        const users = await getAllUsersService(pageSize, cursor);
        return res.status(StatusCodes.OK).json(users);
    } catch (error) {
        Logger.error(`Error in getAllUsers controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const getUserPlaylists = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await getUserByIdService(id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: `User not found` });
        }

        const playlists = user.playlists;
        return res.status(StatusCodes.OK).json(playlists);
    } catch (error) {
        Logger.error(`Error in getUserPlaylists controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
}

const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;

        const user = await getUserById(id);
        const playlists = user.playlists;
        for (const playlist of playlists) {
            const playlistObj = await getPlaylistByIdService(playlist.id);
            const tracks = playlistObj.tracks;
            for (const track of tracks) {
                await deleteTrackService(track.id);
            }
            await deletePlaylistService(playlist.id);
        }

        await deleteUserService(req.params.id);
        return res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        Logger.error(`Error in deleteUser controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

export {
    createUser,
    deleteUser,
    getAllUsers,
    getUserById,
    getUserTokens,
    getUserPreferences,
    updateUser,
    updatePreferences,
    upsertToken,
    replaceUser,
    getUserPlaylists
};