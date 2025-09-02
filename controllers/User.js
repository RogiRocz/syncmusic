import { StatusCodes } from 'http-status-codes';
import { createUser as createUserService } from '../services/User.js';
import { validateUser } from '../models/User.js';
import Logger from '../logs/Logger.js';

export const createUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized: No user information found.' });
        }

        const initialUserData = {
            uid: req.user.uid,
            email: req.user.email
        };

        const validatedUserData = await validateUser(initialUserData);

        const newUser = await createUserService(validatedUserData);

        return res.status(StatusCodes.CREATED).json(newUser);

    } catch (error) {
        Logger.error(`Error in createUser controller: ${error.message}`);

        if (error.message.includes('validation')) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: `Validation Error: ${error.message}` });
        }
        // TODO: Seria bom checar por erros específicos do banco de dados, como usuário já existente
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};
