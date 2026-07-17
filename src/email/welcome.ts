import { recordWelcomeEmail } from '../store';

//
// Stub welcome-email send. In a real app this would call an email provider; here it
// records the send so the example can observe how many went out.
//
export const sendWelcomeEmail = (email: string): void => {

    recordWelcomeEmail(email);

    console.log(`[email] welcome email dispatched to ${email}`);
};
