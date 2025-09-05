import admin from '../config/firebase.js';
import Logger from '../logs/Logger.js';

const getDB = () => admin.database();
const getServerTimestamp = () => admin.database.ServerValue.TIMESTAMP;

const getTrackById = async (trackId) => {
    try {
        const snapshot = await getDB().ref(`tracks/${trackId}`).once('value');
        if (!snapshot.exists()) {
            return null;
        }
        return { id: snapshot.key, ...snapshot.val() };
    } catch (error) {
        Logger.error(`Error retrieving track ${trackId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const getAllTracks = async ({ pageSize = 10, cursor = null }) => {
    try {
        let query = getDB().ref('tracks').orderByKey().limitToFirst(Number(pageSize));
        if (cursor) {
            query = query.startAt(cursor);
        }
        const snapshot = await query.once('value');
        if (!snapshot.exists()) {
            return { tracks: [], nextCursor: null };
        }

        const tracks = [];
        let lastKey = null;
        snapshot.forEach(childSnapshot => {
            tracks.push({ id: childSnapshot.key, ...childSnapshot.val() });
            lastKey = childSnapshot.key;
        });

        const nextCursor = tracks.length === Number(pageSize) ? lastKey : null;
        return { tracks, nextCursor };
    } catch (error) {
        Logger.error(`Error retrieving all tracks: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const createTrack = async (trackData) => {
    try {
        const newTrackRef = getDB().ref('tracks').push();
        const newTrack = {
            ...trackData,
            createdAt: getServerTimestamp(),
            updatedAt: getServerTimestamp(),
        };
        await newTrackRef.set(newTrack);
        Logger.info(`Track created with ID: ${newTrackRef.key}`);
        return { id: newTrackRef.key, ...newTrack };
    } catch (error) {
        Logger.error(`Error creating track: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const updateTrack = async (trackId, updates) => {
    try {
        updates.updatedAt = getServerTimestamp();
        await getDB().ref(`tracks/${trackId}`).update(updates);
        Logger.info(`Track ${trackId} updated successfully.`);
        return getTrackById(trackId);
    } catch (error) {
        Logger.error(`Error updating track ${trackId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const deleteTrack = async (trackId) => {
    try {
        await getDB().ref(`tracks/${trackId}`).remove();
        Logger.info(`Track ${trackId} deleted successfully.`);
    } catch (error) {
        Logger.error(`Error deleting track ${trackId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

export {
    getTrackById,
    getAllTracks,
    createTrack,
    updateTrack,
    deleteTrack,
};
