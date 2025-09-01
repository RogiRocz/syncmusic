import logger from '../logs/Logger'

export function routeLogger(req, res, next) {
    const logMessage = `[${req.method}] - Status: ${res.statusCode} - Path: ${req.originalUrl} - IP: ${req.ip}`
    logger.info(logMessage)
    next()
}