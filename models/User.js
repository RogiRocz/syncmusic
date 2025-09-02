import Joi from 'joi';
import { playlistSchema } from './Playlist.js';

const userSchema = Joi.object({
    uid: Joi.string().required().description("Firebase Auth UID"),
    email: Joi.string().email().required().description("Email of user"),
    playlists: Joi.array().items(playlistSchema).default([]).description("List of playlist regristred by user"),
    accessTokens: Joi.array().items(Joi.object({
       plataformName: Joi.string().optional().description("Name of the plataform"),
       userIdPlataform: Joi.string().optional().description("User ID in the plataform"),
       token: Joi.string().optional().description("Access token"),
       expires: Joi.date().optional().description("Date when the access token expires"),
       createdAt: Joi.date().optional().description("Date when the access token was created"),
       refreshToken: Joi.string().optional().description("Refresh token"),
   })).default([]).description("List of access tokens"),
    preferences: Joi.object({
        defaultSync: Joi.boolean().default(true).description("If the user wants to sync his playlists"),
        notifyOnFailed: Joi.boolean().default(true).description("If the user wants to be notified when a sync fails"),
        syncPlataforms: Joi.array().items(Joi.string()).default([]).description("List of plataforms to sync"),
    }).default({}).description("User preferences"),
    createdAt: Joi.date().default(Date.now).description("Date when the user was created"),
    updatedAt: Joi.date().default(Date.now).description("Date when the user was updated"),
    lastLogin: Joi.date().default(Date.now).description("Date when the user last logged in"),
});

const validateUser = async (user) => {
    try {
        const result = await userSchema.validateAsync(user)
        return result
    } catch (e) {
        throw new Error(`Error validating user: ${e.message}`)
    }
}

export {
    userSchema,
    validateUser
}