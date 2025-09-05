import admin from '../config/firebase.js';
import Logger from '../logs/Logger.js';

// --- Funções Auxiliares ---

const getDB = () => admin.database();
const getServerTimestamp = () => admin.database.ServerValue.TIMESTAMP;

// --- Funções de Leitura ---


const getPlaylists = async (params) => {
    try {
        const { ownerId, pageSize = 10, cursor = null, ...filters } = params;

        const snapshot = await getDB().ref('playlists').orderByChild('ownerId').equalTo(ownerId).once('value');

        if (!snapshot.exists()) {
            return { playlists: [], nextCursor: null };
        }

        const allUserPlaylists = [];
        snapshot.forEach(childSnapshot => {
            allUserPlaylists.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });

        const filteredPlaylists = allUserPlaylists.filter(playlist => {
            return Object.keys(filters).every(key => {
                const filterValue = filters[key];
                if (filterValue === undefined || filterValue === null) {
                    return true;
                }

                if (key === 'name' || key === 'sourcePlataform') {
                    return playlist[key] && playlist[key].toLowerCase().includes(filterValue.toLowerCase());
                }
                if (key === 'isPublic') {
                    return String(playlist[key]) === String(filterValue);
                }

                if(key == 'syncStatus'){
                    if(playlist[key] && playlist){
                        return playlist[key].lastSyncStatus == filterValue;
                    }
                }
            });
        });

        filteredPlaylists.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        // Apply pagination to the filtered and sorted results
        let cursorIndex = 0;
        if (cursor) {
            const foundIndex = filteredPlaylists.findIndex(p => p.id === cursor);
            if (foundIndex !== -1) {
                cursorIndex = foundIndex + 1;
            }
        }
        
        const numPageSize = Number(pageSize);
        const paginatedSlice = filteredPlaylists.slice(cursorIndex, cursorIndex + numPageSize);

        const nextCursor = (cursorIndex + numPageSize < filteredPlaylists.length)
            ? paginatedSlice[paginatedSlice.length - 1]?.id ?? null
            : null;

        return { playlists: paginatedSlice, nextCursor };
    } catch (error) {
        Logger.error(`Error retrieving playlists: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const getPlaylistById = async (playlistId) => {
    try {
        const snapshot = await getDB().ref(`playlists/${playlistId}`).once('value');
        if (!snapshot.exists()) return null;
        return { id: snapshot.key, ...snapshot.val() };
    } catch (error) {
        Logger.error(`Error retrieving playlist ${playlistId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const getAllPlaylists = async (pageSize = 10, cursor = null) => {
    try {
        let query = getDB().ref('playlists').orderByKey().limitToFirst(Number(pageSize));
        if (cursor) {
            query = query.startAt(cursor);
        }
        const snapshot = await query.once('value');
        if (!snapshot.exists()) return { playlists: [], nextCursor: null };

        const playlists = [];
        let lastKey = null;
        snapshot.forEach(childSnapshot => {
            playlists.push({ id: childSnapshot.key, ...childSnapshot.val() });
            lastKey = childSnapshot.key;
        });

        const nextCursor = playlists.length === Number(pageSize) ? lastKey : null;
        return { playlists, nextCursor };
    } catch (error) {
        Logger.error(`Error retrieving all playlists: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

// const getPlaylistBySyncStatus = async (syncStatus) => {
//     try {
//         const snapshot = await getDB().ref('playlists').orderByChild('syncStatus').equalTo(syncStatus).once('value');
//         if (!snapshot.exists()) return [];
//         const playlists = [];
//         snapshot.forEach(childSnapshot => {
//             playlists.push({ id: childSnapshot.key, ...childSnapshot.val() });
//         });
//         return playlists;
//     } catch (error) {
//         Logger.error(`Error retrieving playlists by sync status ${syncStatus}: ${error.message}`, { stack: error.stack });
//         throw error;
//     }
// };

// const getPlaylistSyncStatus = async (playlistId) => {
//     try {
//         const playlist = await getPlaylistById(playlistId);
//         return playlist ? { syncStatus: playlist.syncStatus } : null;
//     } catch (error) {
//         Logger.error(`Error retrieving sync status for playlist ${playlistId}: ${error.message}`, { stack: error.stack });
//         throw error;
//     }
// };

const getPlaylistTracks = async (playlistId) => {
    try {
        const playlist = await getPlaylistById(playlistId);
        return playlist ? playlist.tracks || {} : null;
    } catch (error) {
        Logger.error(`Error retrieving tracks for playlist ${playlistId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};


// --- Funções de Escrita ---

const createPlaylist = async (playlistData) => {
    try {
        const db = getDB();
        const newPlaylistRef = db.ref('playlists').push();
        const newPlaylist = {
            ...playlistData,
            createdAt: getServerTimestamp(),
            updatedAt: getServerTimestamp(),
        };
        await newPlaylistRef.set(newPlaylist);
        Logger.info(`Playlist created with ID: ${newPlaylistRef.key}`);
        return { id: newPlaylistRef.key, ...newPlaylist };
    } catch (error) {
        Logger.error(`Error creating playlist: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const addTrackToPlaylist = async (playlistId, trackData) => {
    try {
        const db = getDB();
        const newTrackRef = db.ref(`playlists/${playlistId}/tracks`).push();
        await newTrackRef.set(trackData);
        await updatePlaylist(playlistId, {}); // To update 'updatedAt'
        Logger.info(`Track ${newTrackRef.key} added to playlist ${playlistId}`);
        return getPlaylistById(playlistId);
    } catch (error) {
        Logger.error(`Error adding track to playlist ${playlistId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const replacePlaylist = async (playlistId, playlistData) => {
    try {
        const fullNewPlaylist = {
            ...playlistData,
            updatedAt: getServerTimestamp(),
        };
        await getDB().ref(`playlists/${playlistId}`).set(fullNewPlaylist);
        Logger.info(`Playlist ${playlistId} replaced successfully.`);
        return getPlaylistById(playlistId);
    } catch (error) {
        Logger.error(`Error replacing playlist ${playlistId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const updatePlaylist = async (playlistId, updates) => {
    try {
        updates.updatedAt = getServerTimestamp();
        await getDB().ref(`playlists/${playlistId}`).update(updates);
        Logger.info(`Playlist ${playlistId} updated successfully.`);
        return getPlaylistById(playlistId);
    } catch (error) {
        Logger.error(`Error updating playlist ${playlistId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const updateSyncStatus = async (playlistId, syncStatus) => {
    try {
        return await updatePlaylist(playlistId, { syncStatus });
    } catch (error) {
        Logger.error(`Error updating sync status for playlist ${playlistId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const deletePlaylist = async (playlistId) => {
    try {
        await getDB().ref(`playlists/${playlistId}`).remove();
        Logger.info(`Playlist ${playlistId} deleted successfully.`);
    } catch (error) {
        Logger.error(`Error deleting playlist ${playlistId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const removeTrackFromPlaylist = async (playlistId, trackId) => {
    try {
        await getDB().ref(`playlists/${playlistId}/tracks/${trackId}`).remove();
        await updatePlaylist(playlistId, {});
        Logger.info(`Track ${trackId} removed from playlist ${playlistId}.`);
    } catch (error) {
        Logger.error(`Error removing track ${trackId} from playlist ${playlistId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

export {
    createPlaylist,
    addTrackToPlaylist,
    getPlaylistById,
    getAllPlaylists,
    getPlaylistTracks,
    replacePlaylist,
    updatePlaylist,
    updateSyncStatus,
    deletePlaylist,
    removeTrackFromPlaylist,
    getPlaylists
};
