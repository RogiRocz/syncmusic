import { StatusCodes } from 'http-status-codes';
import {
    createTrack as createTrackService,
    deleteTrack as deleteTrackService,
    getAllTracks as getAllTracksService,
    getTrackById as getTrackByIdService,
    updateTrack as updateTrackService,
} from '../services/Track.js';
import Logger from '../logs/Logger.js';

const createTrack = async (req, res) => {
    try {
        const newTrack = await createTrackService(req.body);
        return res.status(StatusCodes.CREATED).json(newTrack);
    } catch (error) {
        Logger.error(`Error in createTrack controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const getTrackById = async (req, res) => {
    try {
        const track = await getTrackByIdService(req.params.id);
        if (!track) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: `Track not found` });
        }
        return res.status(StatusCodes.OK).json(track);
    } catch (error) {
        Logger.error(`Error in getTrackById controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const getAllTracks = async (req, res) => {
    try {
        const { pageSize, cursor } = req.query;
        const tracks = await getAllTracksService({ pageSize, cursor });
        return res.status(StatusCodes.OK).json(tracks);
    } catch (error) {
        Logger.error(`Error in getAllTracks controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

const updateTrack = async (req, res) => {
    try {
        const { id } = req.params;
        // TODO: Add validation
        const updatedTrack = await updateTrackService(id, req.body);
        return res.status(StatusCodes.OK).json(updatedTrack);
    } catch (error) {
        Logger.error(`Error in updateTrack controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};


const deleteTrack = async (req, res) => {
    try {
        await deleteTrackService(req.params.id);
        return res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        Logger.error(`Error in deleteTrack controller: ${error.message}`, { stack: error.stack });
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected internal server error occurred.' });
    }
};

export {
    createTrack,
    getTrackById,
    getAllTracks,
    updateTrack,
    deleteTrack,
};
