import { SignupRequest } from '../types';

//
// Admin helper: echoes the email from a signup request so an operator can confirm which
// account a reset targets. Imports `SignupRequest` -- a type the refactor branch retires.
//
export const resetSignup = (req: SignupRequest): string => {

    return req.email;
};
