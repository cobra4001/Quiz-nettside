import type { LoginDto, RegisterDto, UpdateContactDTO, ChangePasswordDTO } from '../types/auth';

// API base URL
const API_URL = import.meta.env.VITE_API_URL;
const API_URL_BASE = import.meta.env.VITE_API_URL_BASE_PATH || "/api";

// Build Authorization header from token or localStorage
function authHeader(token?: string) {
    const t = token ?? localStorage.getItem('token') ?? '';
    return t ? { Authorization: `Bearer ${t}` } : {};
}

// Parse response body and throw on HTTP errors
async function handleResponse(response: Response): Promise<any> {
    const text = await response.text();
    let parsed: any = null;
    if (text) {
        try {
            parsed = JSON.parse(text);
        } catch {
            parsed = text; // keep raw text if not JSON
        }
    }

    if (!response.ok) {
        // Attempt to extract any error text
        if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed)) throw new Error(parsed.join(', '));
            if (parsed.Errors && Array.isArray(parsed.Errors)) throw new Error(parsed.Errors.join(', '));
            if (parsed.message) throw new Error(parsed.message);
        }
        throw new Error(typeof parsed === 'string' && parsed ? parsed : `Request failed (${response.status})`);
    }

    return parsed ?? null;
}

// Log in and return JWT token
export const login = async (credentials: LoginDto): Promise<{ token: string }> => {
    const response = await fetch(`${API_URL}${API_URL_BASE}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    return await handleResponse(response) as { token: string };
};

// Register a new user
export const register = async (userData: RegisterDto): Promise<any> => {
    const response = await fetch(`${API_URL}${API_URL_BASE}/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    return await handleResponse(response);
}

// Update contact information
export const updateContact = async (updateContact: UpdateContactDTO, token?: string): Promise<any> => {
    const response = await fetch(`${API_URL}${API_URL_BASE}/Auth/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) } as HeadersInit,
        body: JSON.stringify(updateContact),
    });
    return await handleResponse(response);
}

// Change account password
export const changePassword = async (changePassword: ChangePasswordDTO, token?: string): Promise<any> => {
    const response = await fetch(`${API_URL}${API_URL_BASE}/Auth/change-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) } as HeadersInit,
        body: JSON.stringify(changePassword)
    });
    return await handleResponse(response);
}

// Fetch the current user's profile
export const fetchProfile = async (token: string): Promise<any> => {
    const headers = { 'Content-Type': 'application/json', ...authHeader(token) } as HeadersInit;

    const response = await fetch(`${API_URL}${API_URL_BASE}/Auth/profile`, {
        method: 'GET',
        headers,
    });
    return await handleResponse(response);
}

// Permanently delete the current user's account
export const deleteAccount = async (token: string): Promise<any> => {
    const response = await fetch(`${API_URL}${API_URL_BASE}/Auth/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeader(token) } as HeadersInit,
    });

    return await handleResponse(response);
}
