export interface User {

    email: string;
    passwordHash: string;
}

export interface SignupRequest {

    email: string;
    password: string;
}

export interface LoginRequest {

    email: string;
    password: string;
}

//
// A stored user profile. `preferences` is held as a wrapped `{ value: { data } }`
// envelope -- the shape the rest of the app reads through `getPreferences`.
//
export interface Profile {

    email: string;
    preferences: { value: { data: string[] } };
}
