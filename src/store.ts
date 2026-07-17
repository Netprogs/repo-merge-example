import { User } from './types';

//
// In-memory user store, plus a log of welcome-email sends so tests can observe how many
// were dispatched for a given address. Fine for an example; a real app would use a database.
//

const usersByEmail = new Map<string, User>();
const welcomeEmailLog: string[] = [];


//
// Options passed when (re)building the store. `seed` preloads users so a test or a boot
// path can start from a known set.
//
export interface StoreRefs {

    seed?: User[];
}


export const buildStore = (refs: StoreRefs = {}): void => {

    usersByEmail.clear();

    for (const user of refs.seed ?? []) {
        usersByEmail.set(user.email, user);
    }
};

export const findUser = (email: string): User | undefined => {

    return usersByEmail.get(email);
};

export const saveUser = (user: User): void => {

    usersByEmail.set(user.email, user);
};

export const recordWelcomeEmail = (email: string): void => {

    welcomeEmailLog.push(email);
};

export const welcomeEmailsSentTo = (email: string): number => {

    return welcomeEmailLog.filter((entry) => entry === email).length;
};
