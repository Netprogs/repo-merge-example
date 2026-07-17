import { findUser } from '../store';
import { LoginRequest } from '../types';


const hash = (password: string): string => {

    return `hashed:${password}`;
};

export interface LoginResult {

    body: unknown;
    status: number;
}

export const handleLogin = (req: LoginRequest): LoginResult => {

    const user = findUser(req.email);

    if (!user || user.passwordHash !== hash(req.password)) {
        return { status: 401, body: { error: 'invalid credentials' } };
    }

    return { status: 200, body: { email: user.email } };
};
