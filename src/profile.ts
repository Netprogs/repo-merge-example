import { Profile } from './types';

const profiles = new Map<string, Profile>();


export const saveProfile = (profile: Profile): void => {

    profiles.set(profile.email, profile);
};

//
// Reads a user's preferences out of the flat preferences array, returning a defensive copy
// so callers cannot mutate stored state.
//
export const getPreferences = (email: string): string[] => {

    const profile = profiles.get(email);

    return profile ? [...profile.preferences] : [];
};
