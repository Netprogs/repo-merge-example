import { sendWelcomeEmail } from '../email/welcome';

//
// Dispatches the welcome email for a signup. `isNew` indicates whether the signup created
// a new user; the current policy sends regardless.
//
export const dispatchWelcome = (email: string, isNew: boolean): void => {

    void isNew;

    sendWelcomeEmail(email);
};
