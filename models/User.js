const Joi = require("joi")
const playlistSchema = require("./Playlist").playlistSchema

const userSchema = Joi.object({
    uid: Joi.string().required().description("Firebase Auth UID"),
    email: Joi.string().email().required().description("Email of user"),
    // Seria interessante colocar também o tempo de adição das playlists
    playlists: Joi.array().items(playlistSchema).default([]).description("List of playlist regristred by user"),
    accessTokens: Joi.array().items(Joi.object({
        plataformName: Joi.string().optional().description("Name of the plataform"),
        userIdPlataform: Joi.string().optional().description("User ID in the plataform"),
        token: Joi.string().optional().description("Access token"),
        expires: Joi.date().optional().description("Date when the access token expires"),
        createdAt: Joi.date().optional().description("Date when the access token was created"),
        refreshToken: Joi.string().optional().description("Refresh token"),
    })).default([]).description("List of access tokens"),
    preferences: Joi.array().items(Joi.object({
        defaultSync: Joi.boolean().default(true).description("If the user wants to sync his playlists"),
        notifyOnFailed: Joi.boolean().default(true).description("If the user wants to be notified when a sync fails"),
        // Vou precisar criar um modelo só para as plataformas para ser melhor de gerenciar
        // Vão ser as mesma que tiver um token de acesso
        syncPlataforms: Joi.string().optional().description("List of plataforms to sync"),
    })).default([]).description("List of user preferences"),
    createdAt: Joi.date().optional().description("Date when the user was created"),
    updatedAt: Joi.date().optional().description("Date when the user was updated"),
    lastLogin: Joi.date().optional().description("Date when the user last logged in"),
})

const validateUser = async (user) => {
    try {
        const result = await userSchema.validateAsync(user)
        return result
    } catch (error) {
        return error
    }
}

const validateUserUpdate = async (updateData) => {
    const updateSchema = Joi.object({
        email: Joi.string().email().optional().description("Email of user"),
        playlists: Joi.array().items(playlistSchema).default([]).optional().description("List of playlist regristred by user"),
        accessTokens: Joi.array().items(Joi.object({
            plataformName: Joi.string().optional().description("Name of the plataform"),
            userIdPlataform: Joi.string().optional().description("User ID in the plataform"),
            token: Joi.string().optional().description("Access token"),
            expires: Joi.date().optional().description("Date when the access token expires"),
            createdAt: Joi.date().optional().description("Date when the access token was created"),
            refreshToken: Joi.string().optional().description("Refresh token"),
        })).default([]).optional().description("List of access tokens"),
        preferences: Joi.array().items(Joi.object({
            defaultSync: Joi.boolean().default(true).optional().description("If the user wants to sync his playlists"),
            notifyOnFailed: Joi.boolean().default(true).optional().description("If the user wants to be notified when a sync fails"),
            syncPlataforms: Joi.string().optional().description("List of plataforms to sync"),
        })).default([]).optional().description("List of user preferences"), 
        updateAt: Joi.date().default(Date.now).optional().description("Date of the last update of the playlist")
    }).min(1)

    return updateSchema.validateAsync(updateData, {stripUnknown: true})
}

module.exports = {
    userSchema,
    validateUser,
    validateUserUpdate
}
