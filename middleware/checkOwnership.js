import Logger from "../logs/Logger";
import { StatusCodes } from "http-status-codes";
import PlaylistService from '../services/Playlist'

const checkUsers = (userResourceId, userId) => {
    return userResourceId === userId;
}

const resourceConfig = {
    user: {
        fetch: UserService.getUserById,
        ownerField: 'id'
    },
    playlist: {
        fetch: PlaylistService.getPlaylistById,
        ownerField: 'ownerId'
    },
    track: {
        fetch: TrackService.getTrackById,
        ownerField: 'playlistId'
    }
}

const checkOwnership = async (resourceType) => {
    return async (req, res, next) => {
        try {
            const { id: resourceId } = req.params;
            const { uid, role } = req.user;

            if (role === 'admin') {
                Logger.debug(`Admin access granted for user ${uid} on resource ${resourceType}/${resourceId}`);
                return next();
            }

            const config = resourceConfig[resourceType];

            switch (resourceType) {
                case 'user': {
                    if (!checkUsers(resourceId, uid)) {
                        Logger.warn(`Forbidden: User ${uid} do not have permission to access resource ${resourceType}/${resourceId}`);
                        return res.status(StatusCodes.FORBIDDEN).json({
                            message: `Access denied: You do not have permission to access this resource.`
                        })
                    }
                    break;
                }
                case 'playlist': {
                    const resource = await config.fetch(resourceId);
                    if (!resource) {
                        Logger.warn(`Resource not found: ${resourceType}/${resourceId}`);
                        return res.status(StatusCodes.NOT_FOUND).json({
                            message: `Resource not found: ${resourceType}/${resourceId}`
                        })
                    }

                    if (!checkUsers(resource[config.ownerField], uid)) {
                        Logger.warn(`Forbidden: User ${uid} do not have permission to access resource ${resourceType}/${resourceId}`);
                        return res.status(StatusCodes.FORBIDDEN).json({
                            message: `Access denied: You do not have permission to access this resource.`
                        })
                    }
                    break;
                }
                case 'track': {
                    const resource = await config.fetch(resourceId);

                    if (!resource) {
                        Logger.warn(`Resource not found: ${resourceType}/${resourceId}`);
                        return res.status(StatusCodes.NOT_FOUND).json({
                            message: `Resource not found: ${resourceType}/${resourceId}`
                        })
                    }

                    const playlistConfig = resourceConfig.playlist;
                    const parentPlaylist = await playlistConfig.fetch(resource.playlistId);
                    
                    if (!parentPlaylist) {
                        Logger.warn(`Resource not found: playlist/${resource.playlistId}`);
                        return res.status(StatusCodes.NOT_FOUND).json({
                            message: `Resource not found: playlist/${resource.playlistId}`
                        })
                    }

                    const playlistOwnerId = parentPlaylist[playlistConfig.ownerField];
                    if (!checkUsers(playlistOwnerId, uid)) {
                        Logger.warn(`Forbidden: User ${uid} do not have permission to access resource ${resourceType}/${resourceId}`);
                        return res.status(StatusCodes.FORBIDDEN).json({
                            message: `Access denied: You do not have permission to access this resource.`
                        })
                    }
                    break;
                }
                default: {
                    Logger.warn(`Invalid resource type: ${resourceType}`);
                    return res.status(StatusCodes.BAD_REQUEST).json({
                        message: `Invalid resource type: ${resourceType}`
                    })
                    break;
                }

            }

            return next();
        } catch (error) {
            Logger.error(`Error in middleware checkOwnership for ${resourceType}/${resourceId}. error: ${error.message}`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: 'Internal server error while checking ownership. of resource.'
            })
        }
    }
}

export {
    checkOwnership
}