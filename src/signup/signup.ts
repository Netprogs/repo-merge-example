import { SignupRequest } from '../types';
import { findUser, saveUser } from '../store';
import { sendWelcomeEmail } from '../email/welcome';


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

    if (!existing) {
        saveUser({ email: req.email, passwordHash: hash(req.password) });
        sendWelcomeEmail(req.email);
    }

    return { status: 201, body: { email: req.email } };
};
