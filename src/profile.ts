import { Profile } from './types';

const profiles = new Map<string, Profile>();


export const saveProfile = (profile: Profile): void => {

    profiles.set(profile.email, profile);
};

//
// Reads a user's preferences out of the (now flat) preferences array.
//
export const getPreferences = (email: string): string[] => {

    const profile = profiles.get(email);

    return profile ? profile.preferences : [];
};
