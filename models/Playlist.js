import Joi from 'joi';
import { trackSchema } from './Track.js';

const playlistSchema = Joi.object({
    id: Joi.string().required().description("ID of the playlist"),
    name: Joi.string().min(1).max(200).required().description("Name of the playlist"),
    description: Joi.string().max(200).optional().description("Description of the playlist"),
    isPublic: Joi.boolean().required().default(false).description("Whether the playlist is public or not"),
    sourcePlataform: Joi.string().max(200).required().description("Name of the source plataform of the playlist"),
    sourcePlataformId: Joi.string().max(200).required().description("ID of the source plataform of the playlist"),
    ownerId: Joi.string().required().description("ID of the owner of the playlist"),
    image: Joi.string().uri().optional().description("Image of the playlist"),
    tracks: Joi.array().items(trackSchema).default([]).description("Tracks in the playlist"),
    syncStatus: Joi.object({
        lastSync: Joi.date().default(Date.now).optional().description("Date of the last sync"),
        lastSyncStatus: Joi.string().max(200).optional().description("Status of the last sync"),
        error: Joi.string().optional().description("Error of the last sync")
    }).default({}),
    createdAt: Joi.date().default(Date.now).optional().description("Date of the creation of the playlist"),
    updatedAt: Joi.date().default(Date.now).optional().description("Date of the last update of the playlist")
});

const validatePlaylist = async (playlist) => {
    try {
        const result = await playlistSchema.validateAsync(playlist, {
            stripUnknown: true
        });
        return result;
    } catch (error) {
        return error;
    }
};

// Precisa ser melhorado na hora de atualizar a playlist para caso foi excluída uma música
const validatePlaylistUpdate = async (updateData) => {
    const updateSchema = Joi.object({
        name: Joi.string().min(1).max(200).optional().description("Name of the playlist"),
        description: Joi.string().max(200).optional().description("Description of the playlist"),
        isPublic: Joi.boolean().optional().description("Whether the playlist is public or not"),
        image: Joi.string().uri().optional().description("Image of the playlist"),
        tracks: Joi.array().items(trackSchema).description("Tracks in the playlist"),
        updateAt: Joi.date().default(Date.now).optional().description("Date of the last update of the playlist")
    }).min(1);

    return await updateSchema.validateAsync(updateData, {stripUnknown: true});
};

export {playlistSchema, validatePlaylist, validatePlaylistUpdate }