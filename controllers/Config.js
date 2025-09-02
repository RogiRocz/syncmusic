import Logger from '../logs/Logger.js';

export const getFirebaseClientConfig = (req, res) => {
    try {
        const firebaseClientConfig = {
            apiKey: process.env.FIREBASE_CLIENT_APIKEY,
            authDomain: process.env.FIREBASE_CLIENT_AUTHDOMAIN,
            projectId: process.env.FIREBASE_CLIENT_PROJECTID,
            storageBucket: process.env.FIREBASE_CLIENT_STORAGEBUCKET,
            messagingSenderId: process.env.FIREBASE_CLIENT_MESSAGINGSENDERID,
            appId: process.env.FIREBASE_CLIENT_APPID,
            databaseURL: process.env.FIREBASE_CLIENT_DATABASEURL,
            measurementId: process.env.FIREBASE_CLIENT_MEASUREMENTID
        };

        for (const key in firebaseClientConfig) {
            if (!firebaseClientConfig[key]) {
                Logger.error(`Configuração do Firebase para o cliente não encontrada na variável de ambiente: ${key.toUpperCase()}`);
                return res.status(500).json({ message: 'Erro na configuração do servidor.' });
            }
        }

        res.status(200).json(firebaseClientConfig);

    } catch (error) {
        Logger.error(`Erro ao buscar a configuração do Firebase para o cliente: ${error.message}`);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};
