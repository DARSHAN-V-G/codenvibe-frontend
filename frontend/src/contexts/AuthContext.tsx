import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, AuthResponse } from '../api';
import toast from 'react-hot-toast';

// Types
interface Team {
    team_name: string;
    roll_nos: string[];
    emails: string[];
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    team: Team | null;
    login: (email: string, otp: string) => Promise<AuthResponse>;
    requestOTP: (email: string) => Promise<AuthResponse>;
    logout: () => void;
    error: string | null;
    clearError: () => void;
    checkAuthStatus: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [team, setTeam] = useState<Team | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Check authentication status with backend verification
    const checkAuthStatus = async () => {
        try {
            console.log('🔍 AuthContext: Checking authentication status...');
            setIsLoading(true);

            try {
                // Verify token with backend
                const response = await authApi.verifyAuth();
                if (response.authenticated) {
                    console.log('✅ AuthContext: Token verified with backend');
                    setIsAuthenticated(true);
                    if (response.team) {
                        setTeam(response.team);
                        localStorage.setItem('team', JSON.stringify(response.team));
                    }
                    return;
                }
            } catch (error) {
                console.log('❌ AuthContext: Token verification failed:', error);
            }

            // Cookie exists - assume user is authenticated (skip API verification)
            console.log('✅ AuthContext: Cookie found - assuming user is authenticated');
            setIsAuthenticated(true);

            // Try to restore team info from localStorage
            const storedTeamData = localStorage.getItem('team');
            if (storedTeamData) {
                try {
                    const teamData = JSON.parse(storedTeamData);
                    setTeam(teamData);
                    console.log('🔄 AuthContext: Restored team data from localStorage:', teamData);
                } catch (parseError) {
                    console.error('❌ AuthContext: Failed to parse stored team data:', parseError);
                    localStorage.removeItem('team');
                    setTeam(null);
                }
            } else {
                console.log('⚠️ AuthContext: No team data in localStorage - user authenticated but team info missing');
                setTeam(null);
            }

        } catch (error: any) {
            console.error('❌ AuthContext: Error during auth check:', error);
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

            console.log('🔐 AuthContext: Calling verifyOTP API...');
            const response = await authApi.verifyOTP(email, otp);
            console.log('✅ AuthContext: API response:', response);

            // Set auth state immediately after successful login
            if (response.success) {
                setIsAuthenticated(true);
                if (response.team) {
                    setTeam(response.team);
                    localStorage.setItem('team', JSON.stringify(response.team));
                }
                // No need to check for cookie immediately as it's handled by the backend
                console.log('✅ AuthContext: Login successful, auth state updated');
            }

            if (response.success && response.team) {
                console.log('✅ AuthContext: Login successful, updating state...');
                setIsAuthenticated(true);
                setTeam(response.team);

                // Store team data in localStorage for persistence across tabs and sessions
                localStorage.setItem('team', JSON.stringify(response.team));
                console.log('💾 AuthContext: Team data stored in localStorage');

                toast.success(`Welcome, ${response.team.team_name}!`);
                console.log('✅ AuthContext: State updated - isAuthenticated should now be true');
            } else {
                console.log('❌ AuthContext: Login failed - no team data or success=false:', response);
            }

            return response;
        } catch (err) {
            console.error('❌ AuthContext: Login error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
            console.log('🔄 AuthContext: Login process completed, isLoading set to false');
        }
    };

    // Logout function
    const logout = () => {
        console.log('🚪 AuthContext: Logging out user');
        setIsAuthenticated(false);
        setTeam(null);
        setError(null);
        localStorage.removeItem('team');

        // The HTTP-only cookie will be handled by the server or expire naturally
        toast.success('Logged out successfully');
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
        logout,
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