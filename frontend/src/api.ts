import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_BACKEND_URL;

// Configure axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for JWT cookies
});

// Request interceptor for logging
apiClient.interceptors.request.use((config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        data: config.data,
        headers: config.headers,
        withCredentials: config.withCredentials,
    });

    // Log cookies being sent (for debugging - this shows all cookies for the domain)
    if (typeof document !== 'undefined') {
        console.log('🍪 Current cookies:', document.cookie);

        // Specifically check for our auth cookie
        const cookies = document.cookie.split(';').map(c => c.trim());
        const authCookie = cookies.find(c => c.startsWith('codenvibe_token='));
        if (authCookie) {
            console.log('✅ codenvibe_token found and will be sent:', authCookie.substring(0, 30) + '...');
        } else {
            console.log('❌ codenvibe_token NOT found in cookies!');
        }

        // Check if withCredentials is properly set
        if (config.withCredentials) {
            console.log('✅ withCredentials is TRUE - cookies will be sent');
        } else {
            console.log('❌ withCredentials is FALSE - cookies will NOT be sent');
        }
    }

    return config;
});

// Response interceptor to handle errors and logging
apiClient.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
            headers: response.headers,
        });

        // Log Set-Cookie headers for debugging
        const setCookieHeader = response.headers['set-cookie'];
        if (setCookieHeader) {
            console.log('🍪 Set-Cookie headers received:', setCookieHeader);
        }

        // Enhanced cookie debugging for login responses
        if (response.config.url?.includes('login') || response.config.url?.includes('verify')) {
            console.log('🔍 Enhanced cookie debugging for auth response:');
            console.log('- Response headers:', response.headers);
            console.log('- All cookies after response:', document.cookie);

            // Check specifically for our token
            const cookies = document.cookie.split(';').map(c => c.trim());
            const tokenCookie = cookies.find(c => c.startsWith('codenvibe_token='));
            console.log('- Our token cookie:', tokenCookie || 'NOT FOUND');
        }

        return response;
    },
    (error) => {
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            headers: error.response?.headers,
        });

        if (error.response?.status === 401) {
            console.log('🔒 Authentication expired - codenvibe_token cookie may be invalid or missing');

            // Enhanced 401 debugging
            console.log('🔍 401 Error Analysis:', {
                frontendOrigin: window.location.origin,
                backendURL: error.config?.baseURL || 'unknown',
                withCredentials: error.config?.withCredentials,
                cookiesPresent: document.cookie.includes('codenvibe_token'),
                allCookies: document.cookie,
                possibleIssues: [
                    'Backend CORS not configured to accept credentials from this origin',
                    'Cookie domain/path mismatch',
                    'Token expired or invalid',
                    'Backend not reading codenvibe_token cookie correctly'
                ]
            });

            // Cookie expired or invalid - the browser will handle cookie removal
        }
        return Promise.reject(error);
    }
);

export interface AuthResponse {
    success: boolean;
    message: string;
    team?: {
        team_name: string;
        roll_nos: string[];
        emails: string[];
    };
}

export interface TestCase {
    input: string;
    expectedOutput: string;
}

export interface Question {
    _id: string;
    number: number;
    year: number;
    title: string;
    description: string;
    correct_code: string;
    incorrect_code: string;
    test_cases: TestCase[];
}

export interface QuestionListItem {
    _id: string;
    title: string;
    description: string;
}

export interface SubmissionResponse {
    submissionid: string;
    passedCount: number;
    newScore: number;
    results: Array<{
        passed: boolean;
        input: string;
        expectedOutput: string;
        actualOutput: string;
        error?: string;
    }>;
}

export interface SubmissionLog {
    _id: string;
    submissionid: string;
    created_at: string;
    status: 'accepted' | 'wrong submission';
}

export interface QuestionLogsResponse {
    logs: SubmissionLog[];
    Question_viewded_at: string;
}

export interface TeamData {
    team_name: string;
    roll_nos: string[];
    emails: string[];
    year: number;
    members: string[];
}

export interface AdminResponse {
    message: string;
    admin?: {
        username: string;
        email: string;
    };
}

export interface ApiError {
    error: string;
    details?: any;
}

export interface LeaderboardEntry {
    _id: string;
    team_name: string;
    score: number;
    solved: number;
    rank: number;
    year: number;
}

export interface LeaderboardResponse {
    success: boolean;
    leaderboard: LeaderboardEntry[];
    timestamp: string;
}

// Authentication API
export const authApi = {
    // Request login OTP
    requestLogin: async (email: string): Promise<AuthResponse> => {
        try {
            const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/request-login', {
                email,
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to request login');
        }
    },

    // Verify OTP and get token
    verifyOTP: async (email: string, otp: string): Promise<AuthResponse> => {
        try {
            const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/verify-otp', {
                email,
                otp,
            });

            // After successful login, check if cookie was set
            setTimeout(() => {
                const cookieCheck = checkAuthCookie();
                console.log('🍪 Post-login cookie check:', cookieCheck);
            }, 100);

            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to verify OTP');
        }
    },

    // Note: /auth/verify endpoint doesn't exist in backend
    // This function is kept for future implementation
    verifyAuth: async (): Promise<{ authenticated: boolean; team?: any }> => {
        // Since the endpoint doesn't exist, we'll return false for now
        // In the future, implement a proper auth verification endpoint
        return { authenticated: false };
    },
};

// Questions API
export const questionApi = {
    // Get all questions for user's year
    getQuestions: async (): Promise<QuestionListItem[]> => {
        try {
            console.log('📚 Making question API request...');
            const response: AxiosResponse<QuestionListItem[]> = await apiClient.get('/question/getQuestion');
            console.log('✅ Questions fetched successfully:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Question fetch failed:', error.response?.data);

            if (error.response?.status === 401) {
                console.log('🔒 Authentication failed during question fetch');
            }

            throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch questions');
        }
    },

    // Get specific question by ID
    getQuestionById: async (id: string): Promise<Question> => {
        try {
            console.log('🔍 API: Fetching question by ID:', id);
            console.log('🔍 API: Full URL will be:', `${API_BASE_URL}/question/question/${id}`);
            
            const response: AxiosResponse<Question> = await apiClient.get(`/question/question/${id}`);
            
            console.log('✅ API: Question response received:', {
                status: response.status,
                dataKeys: Object.keys(response.data || {}),
                hasDescription: !!(response.data as any)?.description,
                hasTitle: !!(response.data as any)?.title,
                fullData: response.data
            });
            
            // Check if the data is nested in a wrapper object
            let questionData = response.data;
            
            // Common API response patterns
            if (questionData && typeof questionData === 'object') {
                // Check if data is wrapped in a 'question' property
                if ((questionData as any).question && !(questionData as any).title) {
                    console.log('🔄 API: Data appears to be wrapped in "question" property');
                    questionData = (questionData as any).question;
                }
                // Check if data is wrapped in a 'data' property
                else if ((questionData as any).data && !(questionData as any).title) {
                    console.log('🔄 API: Data appears to be wrapped in "data" property');
                    questionData = (questionData as any).data;
                }
                // Check if it's an array and we need the first element
                else if (Array.isArray(questionData) && questionData.length > 0) {
                    console.log('🔄 API: Data appears to be an array, taking first element');
                    questionData = questionData[0];
                }
            }
            
            console.log('🏁 API: Final question data:', {
                hasTitle: !!(questionData as any)?.title,
                hasDescription: !!(questionData as any)?.description,
                keys: Object.keys(questionData || {})
            });
            
            return questionData as Question;
        } catch (error: any) {
            console.error('❌ API: getQuestionById failed:', {
                id,
                status: error.response?.status,
                statusText: error.response?.statusText,
                errorData: error.response?.data,
                url: error.config?.url,
                baseURL: error.config?.baseURL
            });
            throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch question');
        }
    },

    // Get submission logs for a specific question
    getQuestionLogs: async (id: string): Promise<QuestionLogsResponse> => {
        try {
            const response: AxiosResponse<QuestionLogsResponse> = await apiClient.get(`/questions/${id}/logs`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to fetch question logs');
        }
    },

    // Admin: Check question with correct code
    checkQuestion: async (id: string): Promise<{ passed: number; total: number; results: any[] }> => {
        try {
            const response: AxiosResponse<{ passed: number; total: number; results: any[] }> =
                await apiClient.post(`/question/check/${id}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to check question');
        }
    },

    // Admin: Get all questions
    getAllQuestions: async (): Promise<{ success: boolean; questions: Question[] }> => {
        try {
            const response: AxiosResponse<{ success: boolean; questions: Question[] }> =
                await apiClient.get('/question/all');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to fetch all questions');
        }
    },

    // Admin: Add new question
    addQuestion: async (questionData: {
        year: number;
        number: number;
        title: string;
        description: string;
        correct_code: string;
        incorrect_code: string;
        test_cases: TestCase[];
    }): Promise<Question> => {
        try {
            const response: AxiosResponse<Question> = await apiClient.post('/question/add', questionData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to add question');
        }
    },

    // Admin: Update question
    updateQuestion: async (id: string, questionData: Partial<Question>): Promise<Question> => {
        try {
            const response: AxiosResponse<Question> = await apiClient.put(`/question/update/${id}`, questionData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to update question');
        }
    },
};

// Submissions API
export const submissionApi = {
    // Submit code for a question
    submitCode: async (code: string, questionid: string): Promise<SubmissionResponse> => {
        try {
            const response: AxiosResponse<SubmissionResponse> = await apiClient.post('/submission/submit', {
                code,
                questionid,
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to submit code');
        }
    },
};

// Leaderboard API
export const leaderboardApi = {
    // Get current leaderboard
    getLeaderboard: async (): Promise<LeaderboardResponse> => {
        try {
            console.log('📊 Fetching leaderboard data...');
            const response: AxiosResponse<LeaderboardResponse> = await apiClient.get('/leaderboard');
            console.log('✅ Leaderboard data fetched:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Leaderboard fetch failed:', error.response?.data);
            throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch leaderboard');
        }
    },

    // Get leaderboard for specific year
    getLeaderboardByYear: async (year: number): Promise<LeaderboardResponse> => {
        try {
            console.log('📊 Fetching leaderboard data for year:', year);
            const response: AxiosResponse<LeaderboardResponse> = await apiClient.get(`/leaderboard/${year}`);
            console.log('✅ Leaderboard data fetched for year:', year, response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Leaderboard fetch failed for year:', year, error.response?.data);
            throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch leaderboard');
        }
    },
};

// Admin API
export const adminApi = {
    // Register admin account
    register: async (username: string, email: string, password: string): Promise<AdminResponse> => {
        try {
            const response: AxiosResponse<AdminResponse> = await apiClient.post('/admin/auth/register', {
                username,
                email,
                password,
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to register admin');
        }
    },

    // Login admin account
    login: async (username: string, password: string): Promise<AdminResponse> => {
        try {
            const response: AxiosResponse<AdminResponse> = await apiClient.post('/admin/auth/login', {
                username,
                password,
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to login admin');
        }
    },

    // Logout admin account
    logout: async (): Promise<AdminResponse> => {
        try {
            const response: AxiosResponse<AdminResponse> = await apiClient.post('/admin/auth/logout');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to logout admin');
        }
    },

    // Add new team
    addTeam: async (teamData: TeamData): Promise<{ message: string; user: any }> => {
        try {
            const response: AxiosResponse<{ message: string; user: any }> =
                await apiClient.post('/admin/add-team', teamData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to add team');
        }
    },

    // Get all teams
    getTeams: async (): Promise<{ success: boolean; teams: TeamData[] }> => {
        try {
            const response: AxiosResponse<{ success: boolean; teams: TeamData[] }> =
                await apiClient.get('/admin/teams');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch teams');
        }
    },

    // Remove team
    removeTeam: async (team_name: string): Promise<{ success: boolean; message: string }> => {
        try {
            const response: AxiosResponse<{ success: boolean; message: string }> =
                await apiClient.delete('/admin/remove-team', { data: { team_name } });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to remove team');
        }
    },
};

// WebSocket setup for real-time leaderboard updates
export const setupWebSocket = (onScoreUpdate: (scores: any) => void) => {
    const wsUrl = API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('🔌 WebSocket connected to:', wsUrl);
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('📊 WebSocket message received:', data);
            onScoreUpdate(data);
        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
        }
    };

    ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        // Optionally implement reconnection logic
    };

    ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
    };

    return ws;
};

// Export everything
export { API_BASE_URL, apiClient };

// Debug function to test cookie transmission
export const debugCookieTransmission = async () => {
    console.log('🧪 Starting Cookie Transmission Debug Test');

    // Check current cookies
    console.log('📋 Current cookies:', document.cookie);

    // Check if our token exists
    const hasToken = document.cookie.includes('codenvibe_token');
    console.log('🎯 codenvibe_token exists:', hasToken);

    // Try a simple GET request to test cookie transmission
    try {
        console.log('🚀 Making test request to /api/questions...');
        const response = await apiClient.get('/api/questions');
        console.log('✅ Test request successful:', response.data);
        return { success: true, data: response.data };
    } catch (error: any) {
        console.log('❌ Test request failed:', error.response?.status, error.response?.data);
        return { success: false, error: error.response?.data };
    }
};

// Utility function to check if codenvibe_token cookie exists (for debugging)
// NOTE: This must match the cookie name used in your backend (currently 'codenvibe_token')
export const checkAuthCookie = (): { exists: boolean; value?: string; allCookies: string } => {
    if (typeof document === 'undefined') return { exists: false, allCookies: '' };

    const allCookies = document.cookie;
    const cookies = allCookies.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('codenvibe_token='));

    console.log('🍪 Enhanced cookie check:', {
        found: !!authCookie,
        allCookies: allCookies || 'NO COOKIES',
        authCookie: authCookie?.trim() || 'NOT FOUND',
        cookieCount: cookies.length,
        url: window.location.origin
    });

    if (authCookie) {
        const tokenValue = authCookie.split('=')[1]?.trim();
        return { exists: true, value: tokenValue, allCookies };
    }

    return { exists: false, allCookies };
};