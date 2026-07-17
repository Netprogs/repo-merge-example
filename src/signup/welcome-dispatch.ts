import { sendWelcomeEmail } from '../email/welcome';

//
// Dispatches the welcome email for a signup. Sends only when the signup created a NEW user
// -- the mainline's duplicate-welcome fix, re-expressed here after the split moved the send
// out of `handleSignup`.
//
export const dispatchWelcome = (email: string, isNew: boolean): void => {

    if (isNew) {
        sendWelcomeEmail(email);
    }
};
