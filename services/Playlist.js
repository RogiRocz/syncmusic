import admin from '../config/firebase.js'
import Logger from '../logs/Logger.js';

// --- Funções Auxiliares ---

const getDB = () => admin.database();
const getServerTimestamp = () => (admin.database.ServerValue.TIMESTAMP);

// --- Funções de Leitura ---

const getPlaylistById = async (playlistId) => {
    try {
        const db = getDB();
        const snapshot = await db.ref(`playlists/${playlistId}`).once('value');
        if (!snapshot.exists()) {
            return null;
        }
        return { id: snapshot.key, ...snapshot.val() };
    } catch (error) {
        Logger.error(`Error retrieving playlist ${playlistId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

const deletePlaylist = async (playlistId) => {
    try {
        const db = getDB();
        await db.ref(`playlists/${playlistId}`).remove();
        Logger.info(`Playlist ${playlistId} deleted successfully.`);
    } catch (error) {
        Logger.error(`Error deleting playlist ${playlistId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

export {
    getPlaylistById,
    deletePlaylist
}