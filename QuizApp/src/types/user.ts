export interface User {
    unique_name: string;
    nameid: string;
    jti: string;
    exp: number;
    iat: number;
    iss: string;
    aud: string;
}