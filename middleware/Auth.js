import firebaseAdmin from '../config/firebase.js'
import logger from '../logs/Logger.js'
import validateToken from '../utils/FirebaseAuth.js'

export async function isAuthenticated(req, res, next) {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.warn('Acesso negado: Bearer token não fornecido ou mal formatado')
            return res.status(401).json({
                error: 'Acesso negado: Bearer token não fornecido ou mal formatado.',
                code: 'MISSING_AUTH_TOKEN'
            })
        }

        const idToken = authHeader.split(' ')[1]
        const decodedToken = await validateToken(idToken)
        
        req.user = decodedToken
        next()
    } catch (error) {
        logger.error('Erro de autenticação:', error)
        return res.status(401).send('Acesso não autorizado.');
    }
}
