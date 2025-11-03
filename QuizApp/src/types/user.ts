export interface User {
    unique_name: string;
    nameid: string;
    jti: string;
    exp: number;
    iat: number;
    iss: string;
    aud: string;
    role?: string | string[]; // Can be a single role or an array of roles
}

export interface UserProfile {
    username: string;
    email: string;
    phonenumber: string;
    roles: string[];
}