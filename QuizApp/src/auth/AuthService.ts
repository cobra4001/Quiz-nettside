import type { LoginDto, RegisterDto } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (credentials: LoginDto): Promise<{ token: string }> => {
    const response = await fetch(`${API_URL}/api/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        // Try to extract any error text
        const txt = await response.text();
        throw new Error(txt || 'Login failed');
    }

    const text = await response.text();
    if (!text) throw new Error('Login failed: empty response');
    try {
        return JSON.parse(text);
    } catch {
        throw new Error('Login failed: invalid JSON from server');
    }
};

export const register = async (userData: RegisterDto): Promise<any> => {
    const response = await fetch(`${API_URL}/api/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    const raw = await response.text(); // read once

    if (!response.ok) {
        // Attempt to parse structured errors
        try {
            const parsed = raw ? JSON.parse(raw) : {};
            // Backend currently returns { Errors: [] } when identity fails
            if (Array.isArray(parsed)) {
                throw new Error(parsed.join(', '));
            }
            if (parsed.Errors && Array.isArray(parsed.Errors)) {
                throw new Error(parsed.Errors.join(', '));
            }
            if (parsed.message) {
                throw new Error(parsed.message);
            }
            throw new Error(raw || `Registration failed (${response.status})`);
        } catch (e:any) {
            // If JSON parse failed just bubble a generic with raw text
            if (e instanceof Error && e.message && !e.message.startsWith('Registration failed')) {
                throw e;
            }
            throw new Error(raw || 'Registration failed');
        }
    }

    if (!raw) {
        // Gracefully handle empty 200 OK
        return { message: 'User registered successfully (no body)' };
    }
    try {
        return JSON.parse(raw);
    } catch {
        return { message: 'User registered (unparseable response)', raw };
    }
};

// Logout is handled client-side by clearing the token.