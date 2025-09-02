import admin from '../config/firebase.js';
import { userSchema, validateUser } from '../models/User.js';
import Logger from '../logs/Logger.js';

const createUser = async (userData) => {
    const { uid, email, playlists, accessTokens, preferences, createdAt, updatedAt, lastLogin } = userData;

    try {
        const database = admin.database();
        
        const userToSave = {
            uid,
            email,
            playlists,
            accessTokens,
            preferences,
            createdAt,
            updatedAt,
            lastLogin
        };

        await database.ref(`users/${uid}`).set(userToSave);

        Logger.info(`User created in database with uid: ${uid}`);
        return userToSave;

    } catch (error) {
        Logger.error(`Error creating user in database: ${error.message}`);
        throw new Error(`Database error: ${error.message}`);
    }
};

export { createUser };