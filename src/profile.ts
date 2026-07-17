import { Profile } from './types';

const profiles = new Map<string, Profile>();


export const saveProfile = (profile: Profile): void => {

    profiles.set(profile.email, profile);
};

//
// Reads a user's preferences out of the wrapped envelope. Callers depend on this accessor
// rather than reaching into `preferences.value.data` themselves.
//
export const getPreferences = (email: string): string[] => {

    const profile = profiles.get(email);

    return profile ? profile.preferences.value.data : [];
};
