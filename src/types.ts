export interface User {

    email: string;
    passwordHash: string;
}

export interface Credentials {

    email: string;
    password: string;
}

export interface LoginRequest {

    email: string;
    password: string;
}

export interface Profile {

    email: string;
    preferences: string[];
}
