import { SignupRequest } from '../types';
import { findUser, saveUser } from '../store';
import { dispatchWelcome } from './welcome-dispatch';


const hash = (password: string): string => {

    return `hashed:${password}`;
};

export interface SignupResult {

    body: unknown;
    status: number;
}

export const handleSignup = (req: SignupRequest): SignupResult => {

    if (!req.email || !req.password) {
        return { status: 400, body: { error: 'email and password are required' } };
    }

    const existing = findUser(req.email);
    const isNew = !existing;

    if (isNew) {
        saveUser({ email: req.email, passwordHash: hash(req.password) });
    }

    dispatchWelcome(req.email, isNew);

    return { status: 201, body: { email: req.email } };
};
