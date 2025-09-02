import logger from '../logs/Logger.js'

const routesLogs = (req, res, next) => {
    res.on('finish', () => {
        const finishMessage = `[${req.method}] ${req.originalUrl} - STATUS: ${res.statusCode} - IP: ${req.ip}`;
        if (res.statusCode >= 400) {
            logger.warn(finishMessage);
        } else {
            logger.info(finishMessage);
        }
    });

    next();
}

export default routesLogs;
