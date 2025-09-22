import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { 
  ApiResponse, 
  QuestionData, 
  TeamData, 
  AuthData, 
  Round2QuestionData,
  Round2Submission 
} from '../types/api';

const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  timeout: 30000,
  withCredentials: true,
}) as AxiosInstance;

// Request interceptor
API.interceptors.request.use(
  (config: any) => {
    return config;
  },
  (error: any) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response: any) => response.data,
  (error: any) => {
    if (error.response?.status === 401) {
      console.error('Auth Error:', error.response.data?.message || '401 Unauthorized');
    }
    return Promise.reject(error.response?.data || error);
  }
);

const api = {
  // Admin Authenticati
    adminLogin: (username: string, password: string): Promise<ApiResponse> => 
      API.post('/admin/auth/login', { username, password }),
    
    adminLogout: (): Promise<ApiResponse> => 
      API.post('/admin/auth/logout'),
    
    register: (username: string, email: string, password: string): Promise<ApiResponse> => 
      API.post('/admin/auth/register', { username, email, password }),
  
    getAllQuestions: (): Promise<ApiResponse<QuestionData[]>> => 
      API.get('/question/all'),
    
    addQuestion: (questionData: QuestionData): Promise<ApiResponse> => 
      API.post('/question/add', questionData),
    
    updateQuestion: (id: string, questionData: Partial<QuestionData>): Promise<ApiResponse> => 
      API.put(`/question/update/${id}`, questionData),
    
    checkQuestion: (id: string): Promise<ApiResponse> => 
      API.post(`/question/check/${id}`),

    getAllTeams: (): Promise<ApiResponse<TeamData[]>> => 
      API.get('/admin/teams'),
    
    addTeam: (teamData: TeamData): Promise<ApiResponse> => 
      API.post('/admin/add-team', teamData),
    
    removeTeam: (teamName: string): Promise<ApiResponse> => 
      API.delete('/admin/remove-team', { data: { team_name: teamName } }),
    
    updateTeam: (teamName: string, teamData: Partial<TeamData>): Promise<ApiResponse> => 
      API.put('/admin/update-team', { team_name: teamName, ...teamData }),
    
    getLogs: (): Promise<ApiResponse> => 
      API.get('/admin/logs'),
    
    // Round 2 Question APIs
    getAllRound2Questions: (): Promise<ApiResponse<Round2QuestionData[]>> => 
      API.get('/admin/getround2-questions'),
    
    addRound2Question: (description: string): Promise<ApiResponse<Round2QuestionData>> => 
      API.post('/admin/round2-question', { description }),

    getRound2Submissions: (questionId: string): Promise<ApiResponse<Round2Submission[]>> =>
      API.get(`/admin/getround2-submission/${questionId}`),
      
    // Round Management
    updateRound: (round: number): Promise<ApiResponse> =>
      API.post('/admin/update-round', { round })
};

export default api;