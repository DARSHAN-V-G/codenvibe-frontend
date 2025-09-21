

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, AuthResponse } from '../api';
import toast from 'react-hot-toast';

// Types
export type Team = {
    team_id?: string;
    team_name: string;
    roll_nos?: string[];
    emails?: string[];
    year?: number;
    // Add other team properties as needed
};

export type AuthContextType = {
    isAuthenticated: boolean;
    isLoading: boolean;
    team: Team | null;
    error: string | null;
    login: (email: string, otp: string) => Promise<AuthResponse>;
    requestOTP: (email: string) => Promise<AuthResponse>;
    clearError: () => void;
    checkAuthStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Start with true to prevent flash of unauthenticated state
    const [team, setTeam] = useState<Team | null>(null);
    const [error, setError] = useState<string | null>(null);

    const checkAuthStatus = async () => {
        try {
            setIsLoading(true);
            const storedTeamData = localStorage.getItem('team');

            if (storedTeamData) {
                try {
                    const teamData = JSON.parse(storedTeamData);
                    setTeam(teamData);
                    setIsAuthenticated(true);
                   } catch (parseError) {
                    console.error('❌ AuthContext: Failed to parse team data:', parseError);
                    localStorage.removeItem('team');
                    setIsAuthenticated(false);
                    setTeam(null);
                }
            } else {
                setIsAuthenticated(false);
                setTeam(null);
            }
        } catch (error) {
            setIsAuthenticated(false);
            setTeam(null);
            localStorage.removeItem('team');
        } finally {
            setIsLoading(false);
            }
    };

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Request OTP function
    const requestOTP = async (email: string): Promise<AuthResponse> => {
        try {
            setError(null);
            setIsLoading(true);
            const response = await authApi.requestLogin(email);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to request OTP';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Login function
    const login = async (email: string, otp: string): Promise<AuthResponse> => {
        try {
            setError(null);
            setIsLoading(true);
            const response = await authApi.verifyOTP(email, otp);
            
            if (response.success && response.team) {
                setIsAuthenticated(true);
                setTeam(response.team);
                localStorage.setItem('team', JSON.stringify(response.team));
                // Store year separately for WebSocket context
                if (response.team.year) {
                    localStorage.setItem('year', response.team.year.toString());
                    }
                toast.success(`Welcome, ${response.team.team_name}!`);
            }
            
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Clear error function
    const clearError = () => {
        setError(null);
    };

    const value: AuthContextType = {
        isAuthenticated,
        isLoading,
        team,
        login,
        requestOTP,
        error,
        clearError,
        checkAuthStatus,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;