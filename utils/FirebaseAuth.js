import admin from '../config/firebase.js'
import Logger from '../logs/Logger.js'

const validateToken = async token => {
    try {
        const decodeToken = await admin.auth().verifyIdToken(token);
        return decodeToken;
    } catch (err) {
        Logger.error(`Error in validate token. error: ${err.message}`);
        
        throw {
            code: err.code,
            message: err.message
        };
    }
}

export default validateToken
