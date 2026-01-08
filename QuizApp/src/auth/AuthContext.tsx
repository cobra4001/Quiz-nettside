import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User } from '../types/user';
import type { ChangePasswordDTO, LoginDto, RegisterDto, UpdateContactDTO } from '../types/auth';
import * as authService from '../utils/AuthService';

interface AuthContextType { // Define the shape of the auth context
    user: User | null;
    token: string | null;
    login: (credentials: LoginDto) => Promise<void>;
    register: (userData: RegisterDto ) => Promise<void>;
    fetchProfile: (recievedToken: string) => Promise<void>;
    updateContact: (updateContact: UpdateContactDTO) => Promise<void>;
    changePassword: (changePassword: ChangePasswordDTO) => Promise<void>;
    deleteAccount: () => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => { // Check token validity on mount and when token changes
        if (token) {
            try {
                const decodedUser: User = jwtDecode(token);
                // Check if the token is expired
                if (decodedUser.exp * 1000 > Date.now()) {
                    setUser(decodedUser);
                } else {
                    // Token is expired, clear it
                    console.warn("Token expired");
                    localStorage.removeItem('token');
                    setUser(null);
                    setToken(null);
                }
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem('token');
            }
        }
        setIsLoading(false);
    }, [token]);

    const login = async (credentials: LoginDto) => { // Login and store token
        const { token } = await authService.login(credentials);
        localStorage.setItem('token', token);
        const decodedUser: User = jwtDecode(token);
        // console.log(token); // Debugging line to check the token
        setUser(decodedUser);
        setToken(token);
    };

    const register = async (userData: RegisterDto) => { 
        await authService.register(userData);
    }

    const logout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setTimeout(() => setIsLoggingOut(false), 0)
    };

    const fetchProfile = async () => { 
        return await authService.fetchProfile(token as string);
    }

    const updateContact = async (updateContact: UpdateContactDTO) => { 
        await authService.updateContact(updateContact, token as string);
    }

    const changePassword = async (changePassword: ChangePasswordDTO) => {
        await authService.changePassword(changePassword, token as string);
    }

    const deleteAccount = async () => { 
        await authService.deleteAccount(token as string);
        logout();
    }

    return ( // Provide context to children
        <AuthContext.Provider value={{ user, token, login, logout, register, 
        updateContact, changePassword, deleteAccount, fetchProfile, isLoading, isLoggingOut }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => { // Custom hook to use auth context
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};