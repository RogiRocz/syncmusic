import Joi from 'joi';

export const trackSchema = Joi.object({
    id: Joi.string().required().description("ID of the track"),
    name: Joi.string().min(1).max(200).required().description("Name of the track"),
    artist: Joi.string().min(1).max(200).required().description("Name of the artist"),
    featuring: Joi.array().items(Joi.string()).default([]).description("Names of the artists featuring in the track"),
    album: Joi.string().min(1).max(200).required().description("Name of the album"),
    released: Joi.date().optional().description("Date the track was released"),
    duration: Joi.number().integer().min(0).optional().description("Duration of the track in seconds"),
    image: Joi.string().uri().optional().description("Image of the track"),
    url: Joi.string().uri().optional().description("URL of the track"),
    playlistId: Joi.string().required().description("ID of the playlist the track belongs to")
});

export const validateTrack = async (track) => {
    try {
        const result = await trackSchema.validateAsync(track);
        return result;
    } catch (error) {
        return error;
    }
};

export const validateTrackArray = async (tracks) => {
    if (!Array.isArray(tracks)) {
        return { errors: new Error("Tracks must be an array"), validTracks: [] };
    }

    const errors = [];
    const validTracks = [];

    const validationPromises = tracks.map(async (track, index) => {
        try {
            const result = await validateTrack(track);
            validTracks.push(result);
        } catch (error) {
            errors.push({ index, error });
        }
    });
    await Promise.all(validationPromises);

    return {
        errors: errors.length > 0 ? errors : null,
        validTracks
    };
};