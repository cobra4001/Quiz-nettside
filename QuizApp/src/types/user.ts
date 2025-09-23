export interface User {
    jti: string;
    username: string;
    exp: number;
    iat: number;
    iss: string;
    aud: string;
}