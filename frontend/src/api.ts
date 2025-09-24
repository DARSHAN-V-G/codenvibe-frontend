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

// Response interceptor to handle errors and logging
apiClient.interceptors.response.use(
    (response) => {
        // Enhanced cookie handling for login responses
        if (response.config.url?.includes('login') || response.config.url?.includes('verify')) {
            document.cookie.split(';').map(c => c.trim());
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Cookie expired or invalid - the browser will handle cookie removal
        }
        return Promise.reject(error);
    }
);

// Types
export interface Round2Question {
    _id: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface SubmissionResponse {
    success: boolean;
    error?: string;
}

export interface SubmissionCheckResponse {
    exists: boolean;
    submission?: {
        _id: string;
    };
    error?: string;
}

export interface CurrentRoundResponse {
    success: boolean;
    current_round?: number;
    error?: string;
}

// Round 2 API functions
export const round2Api = {
    // Get all Round 2 questions
    getQuestions: async (): Promise<{ success: boolean; questions: Round2Question[]; error?: string }> => {
        try {
            const response = await apiClient.get('/question/round2');
            return response.data;
        } catch (error) {
            throw new Error('Error loading Round 2 questions');
        }
    },

    // Check if submission exists
    checkSubmission: async (questionId: string): Promise<SubmissionCheckResponse> => {
        try {
            const response = await apiClient.get(`/round2/checksubmission/${questionId}`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to check submission status');
        }
    },

    // Submit Round 2 solution
    submit: async (formData: FormData): Promise<SubmissionResponse> => {
        try {
            const response = await apiClient.post('/round2/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error submitting solution');
        }
    }
};

export interface AuthResponse {
    success: boolean;
    message: string;
    team?: {
        team_name: string;
        roll_nos: string[];
        emails: string[];
        year: number;
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
    solved: boolean;
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
    testcases_passed: number[];
    year: number;
    solved?: number;
    rank?: number;
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
            const response: AxiosResponse<AuthResponse> = await axios.post('https://ghcc.psgtech.ac.in/backend/githeist/auth/request-login', {
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

            // Cookie check handled silently

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
            const response: AxiosResponse<QuestionListItem[]> = await apiClient.get('/question/getQuestion');
            return response.data;
        } catch (error: any) {
            // Handle error silently

            throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch questions');
        }
    },

    // Get specific question by ID
    getQuestionById: async (id: string): Promise<Question> => {
        try {
            const response: AxiosResponse<Question> = await apiClient.get(`/question/question/${id}`);
            
            // Check if the data is nested in a wrapper object
            let questionData = response.data;
            
            // Common API response patterns
            if (questionData && typeof questionData === 'object') {
                // Check if data is wrapped in a 'question' property
                if ((questionData as any).question && !(questionData as any).title) {
                    questionData = (questionData as any).question;
                }
                // Check if data is wrapped in a 'data' property
                else if ((questionData as any).data && !(questionData as any).title) {
                    questionData = (questionData as any).data;
                }
                // Check if it's an array and we need the first element
                else if (Array.isArray(questionData) && questionData.length > 0) {
                    questionData = questionData[0];
                }
            }
            
            return questionData as Question;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch question');
        }
    },

    // Get submission logs for a specific question
    getQuestionLogs: async (id: string): Promise<QuestionLogsResponse> => {
        try {
            const response: AxiosResponse<QuestionLogsResponse> = await apiClient.get(`/question/logs/${id}`);
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

// WebSocket setup for real-time leaderboard updates
export const setupLeaderboardWebSocket = (onUpdate: (data: LeaderboardEntry[]) => void) => {
    const wsUrl = API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    //const wsUrl = "wss://ghcc.psgtech.ac.in/backend/githeist/";
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {};

    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);

            if (message.type === 'scores' && Array.isArray(message.teams)) {
                // Transform the data to match our LeaderboardEntry interface
                const leaderboardData = message.teams.map((team: any) => ({
                    _id: team._id || '',
                    team_name: team.team_name,
                    score: team.score ? Math.round(Number(team.score) * 100) / 100 : 0,
                    testcases_passed: team.testcases_passed || [],
                    year: team.year || 0,
                    // Calculate solved count if testcases_passed exists
                    solved: team.testcases_passed ? 
                        team.testcases_passed.filter((score: number) => score >= 8).length : 0
                }));
                onUpdate(leaderboardData);
            }
        } catch (error) {
            // Handle error silently
        }
    };

    ws.onclose = () => {};

    ws.onerror = () => {};

    return ws;
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
getCurrentRound: async (): Promise<CurrentRoundResponse> => {
        try {
            const response: AxiosResponse<CurrentRoundResponse> = await apiClient.get('/current-round');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to get current round');
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

    ws.onopen = () => {};

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            onScoreUpdate(data);
        } catch (error) {
            // Handle error silently
        }
    };

    ws.onclose = () => {
        // Optionally implement reconnection logic
    };

    ws.onerror = () => {};

    return ws;
};

// Export everything
export { API_BASE_URL, apiClient };

// Debug function to test cookie transmission
export const debugCookieTransmission = async () => {
    try {
        const response = await apiClient.get('/api/questions');
        return { success: true, data: response.data };
    } catch (error: any) {
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

    if (authCookie) {
        const tokenValue = authCookie.split('=')[1]?.trim();
        return { exists: true, value: tokenValue, allCookies };
    }

    return { exists: false, allCookies };
};