import admin from '../config/firebase'
import Logger from '../logs/Logger'

const validateToken = async token => {
    try {
        const decodeToken = await admin.auth().verifyIdToken(token);
        return decodeToken;
    } catch (err) {
        console.error('Erro ao validar token:', err);
        Logger.error('Erro ao validar token:', err);
        
        throw {
            code: err.code,
            message: err.message
        };
    }
}

export default validateToken
