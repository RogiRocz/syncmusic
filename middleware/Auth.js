import { StatusCodes } from 'http-status-codes';
import validateToken from '../utils/FirebaseAuth.js';
import Logger from '../logs/Logger.js';

const isAuthenticaded = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            Logger.warn('Acesso negado: Bearer token não fornecido ou mal formatado');
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Acesso negado: Bearer token não fornecido ou mal formatado.',
                code: 'MISSING_AUTH_TOKEN'
            });
        }

        const idToken = authHeader.split(' ')[1];
        const decodedToken = await validateToken(idToken);

        req.user = {
            uid: decodedToken.uid,
            role: decodedToken.role || 'user'
        };
        next();
    } catch (error) {
        Logger.error(`Erro de autenticação final no middleware: ${error.message}`);
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Acesso não autorizado.',
            code: error.code || 'AUTH_ERROR'
        });
    }
};

const hasRole = async (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role != role) {
            Logger.warn(`Forbidden: User ${req.user?.uid} with role ${req.user?.role} tried to access a route requiring ${role}`);
            return res.status(StatusCodes.FORBIDDEN).json({
                message: `Access denied: You need to have ${role} role to access this route.}`
            });
        }
        next();
    }
};

export {
    isAuthenticaded,
    hasRole
}