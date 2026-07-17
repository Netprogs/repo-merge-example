import { Credentials } from '../types';

//
// Admin helper: echoes the email from a signup request so an operator can confirm which
// account a reset targets.
//
export const resetSignup = (req: Credentials): string => {

    return req.email;
};
