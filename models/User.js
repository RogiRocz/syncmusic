import Joi from 'joi';

const userSchema = Joi.object({
    id: Joi.string().required().description("Firebase Auth UID"),
    email: Joi.string().email().required().description("Email of user"),
    playlists: Joi.array().items(Joi.string()).default([]).description("List of playlist IDs that are regristred by user"),
    accessTokens: Joi.object().default({}).description("Map of access tokens, with plataformName as key"),
    preferences: Joi.object({
        defaultSync: Joi.boolean().default(true),
        notifyOnFailed: Joi.boolean().default(true),
        syncPlataforms: Joi.array().items(Joi.string()).default([]),
    }).default({}),
    createdAt: Joi.date().default(() => new Date().toISOString()),
    updatedAt: Joi.date().default(() => new Date().toISOString()),
    lastLogin: Joi.date().default(() => new Date().toISOString()),
});

const validateUserCreation = async (user) => {
    try {
        return await userSchema.validateAsync(user);
    } catch (e) {
        throw new Error(`Error in user creation validation: ${e.message}`);
    }
};

const validateReplaceUser = async (data) => {
    try {
        return await userSchema.validateAsync(data);
    } catch (error) {
        throw new Error(`Error in user replace validation: ${error.message}`);
    }
}

const validateUserUpdate = async (data) => {
    const generalUpdateSchema = Joi.object({
        email: Joi.string().email()
    });

    try {
        return await generalUpdateSchema.validateAsync(data, { abortEarly: false });
    } catch (e) {
        throw new Error(`Error in general user update validation: ${e.message}`);
    }
};

const validateTokenData = async (tokenData) => {
    const tokenSchema = Joi.object({
        userIdPlataform: Joi.string().required(),
        token: Joi.string().required(),
        expires: Joi.date().required(),
        refreshToken: Joi.string().allow(null, '')
    });

    try {
        return await tokenSchema.validateAsync(tokenData);
    } catch (e) {
        throw new Error(`Token data validation failed: ${e.message}`);
    }
};

const validatePreferences = async (preferencesData) => {
    const preferencesSchema = Joi.object({
        defaultSync: Joi.boolean(),
        notifyOnFailed: Joi.boolean(),
        syncPlataforms: Joi.array().items(Joi.string())
    });
     try {
        return await preferencesSchema.validateAsync(preferencesData);
    } catch (e) {
        throw new Error(`Preferences validation failed: ${e.message}`);
    }
}

export {
    userSchema,
    validateUserCreation,
    validateUserUpdate, 
    validateTokenData,
    validatePreferences,
    validateReplaceUser
};
