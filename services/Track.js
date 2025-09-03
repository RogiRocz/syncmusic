import admin from '../config/firebase.js'
import Logger from '../logs/Logger.js';

// --- Funções Auxiliares ---

const getDB = () => admin.database();
const getServerTimestamp = () => (admin.database.ServerValue.TIMESTAMP);

// --- Funções de Leitura ---

const getTrackById = async (trackId) => {
    try {
        const db = getDB();
        const snapshot = await db.ref(`tracks/${trackId}`).once('value');
        if (!snapshot.exists()) {
            return null;
        }
        return { id: snapshot.key, ...snapshot.val() };
    } catch (error) {
        Logger.error(`Error retrieving track ${trackId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

const deleteTrack = async (trackId) => {
    try {
        const db = getDB();
        await db.ref(`tracks/${trackId}`).remove();
        Logger.info(`Track ${trackId} deleted successfully.`);
    } catch (error) {
        Logger.error(`Error deleting track ${trackId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

export {
    getTrackById,
    deleteTrack
}