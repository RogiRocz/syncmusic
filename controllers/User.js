import { createUser as createUserService } from '../services/User.js';
import { validateUser } from '../models/User.js';
import Logger from '../logs/Logger.js';

export const createUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: No user information found.' });
        }

        const initialUserData = {
            uid: req.user.uid,
            email: req.user.email
        };

        const validatedUserData = await validateUser(initialUserData);

        const newUser = await createUserService(validatedUserData);

        return res.status(201).json(newUser);

    } catch (error) {
        Logger.error(`Error in createUser controller: ${error.message}`);

        if (error.message.includes('validation')) {
            return res.status(400).json({ message: `Validation Error: ${error.message}` });
        }
        // TODO: Seria bom checar por erros específicos do banco de dados, como usuário já existente
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
