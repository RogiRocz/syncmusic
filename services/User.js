import admin from '../config/firebase.js';
import Logger from '../logs/Logger.js';
const getDB = () => admin.database();

// --- Funções Auxiliares ---

const getServerTimestamp = () => (admin.database.ServerValue.TIMESTAMP);

// --- Funções de Leitura ---

const getAllUsers = async (pageSize = 15, cursor = null) => {
    const db = getDB();
    try {
        let query = db.ref('users').orderByKey();
        if (cursor) {
            query = query.startAt(cursor);
        }
        const limit = pageSize + 1;
        query = query.limitToFirst(limit);

        const snapshot = await query.once('value');
        if (!snapshot.exists()) {
            return { users: [], nextCursor: null };
        }

        const usersData = snapshot.val();
        const userIds = Object.keys(usersData);
        let users = userIds.map(id => ({ id, ...usersData[id] }));

        let nextCursor = null;
        if (users.length > pageSize) {
            const nextCursorUser = users.pop();
            nextCursor = nextCursorUser.id;
        }

        return { users, nextCursor };
    } catch (error) {
        Logger.error(`Error retrieving all users: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const getUserById = async (userId) => {
    const db = getDB();
    try {
        const snapshot = await db.ref(`users/${userId}`).once('value');
        if (!snapshot.exists()) {
            return null;
        }
        return { id: snapshot.key, ...snapshot.val() };
    } catch (error) {
        Logger.error(`Error retrieving user ${userId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const getUserTokens = async (userId) => {
    const db = getDB();
    try {
        const snapshot = await db.ref(`users/${userId}/accessTokens`).once('value');
        return snapshot.val() || {};
    } catch (error) {
        Logger.error(`Error retrieving tokens for user ${userId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const getUserPreferences = async (userId) => {
    const db = getDB();
    try {
        const snapshot = await db.ref(`users/${userId}/preferences`).once('value');
        return snapshot.val() || {};
    } catch (error) {
        Logger.error(`Error retrieving preferences for user ${userId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

// --- Funções de Escrita ---

const createUser = async (userData) => {
    const db = getDB();
    try {
        const newUserRef = db.ref(`users/${userData.id}`);
        const finalUserData = {
            ...userData,
            createdAt: getServerTimestamp(),
            updatedAt: getServerTimestamp()
        };
        await newUserRef.set(finalUserData);
        Logger.info(`User created with ID: ${userData.id}`);
        return await getUserById(userData.id);
    } catch (error) {
        Logger.error(`Error creating user: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const updateUser = async (userId, userData) => {
    const db = getDB();
    try {
        const updateData = {
            ...userData,
            updatedAt: getServerTimestamp()
        };
        await db.ref(`users/${userId}`).update(updateData);
        Logger.info(`User updated: ${userId}`);
        return await getUserById(userId);
    } catch (error) {
        Logger.error(`Error updating user ${userId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const replaceUser = async (userId, userData) => {
    const db = getDB();
    try {
        const replaceData = {
            ...userData,
            updatedAt: getServerTimestamp()
        };
        await db.ref(`users/${userId}`).set(replaceData);
        Logger.info(`User replaced: ${userId}`);
        return await getUserById(userId);
    } catch (error) {
        Logger.error(`Error replacing user ${userId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

const upsertAccessToken = async (userId, platformName, tokenData) => {
    const db = getDB();
    try {
        const updates = {};
        updates[`users/${userId}/accessTokens/${platformName}`] = tokenData;
        updates[`users/${userId}/updatedAt`] = getServerTimestamp();

        await db.ref().update(updates);
        Logger.info(`Access token for ${platformName} upserted for user ${userId}`);
        return await getUserById(userId);
    } catch (error) {
        Logger.error(`Error upserting token for user ${userId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
}

const updateUserPreferences = async (userId, preferencesData) => {
    const db = getDB();
    try {
        const updates = {};
        updates[`users/${userId}/preferences`] = preferencesData;
        updates[`users/${userId}/updatedAt`] = getServerTimestamp();

        await db.ref().update(updates);
        Logger.info(`Preferences updated for user ${userId}`);
        return await getUserById(userId);
    } catch (error) {
        Logger.error(`Error updating preferences for user ${userId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

const deleteUser = async (userId) => {
    try {
        const db = getDB();
        await db.ref(`users/${userId}`).remove();
        Logger.info(`User deleted: ${userId}`);
        return true;
    } catch (error) {
        Logger.error(`Error deleting user ${userId}: ${error.message}`, { stack: error.stack });
        throw error;
    }
};

export {
    createUser,
    deleteUser,
    getAllUsers,
    getUserById,
    upsertAccessToken,
    getUserTokens,
    getUserPreferences,
    updateUser,
    replaceUser,
    updateUserPreferences
};