// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Question related types
export interface QuestionData {
  id?: string;
  year: number;
  title?: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  categories?: string[];
  correct_code: string;
  incorrect_code: string;
  test_cases: TestCase[];
  solution?: string;
  timeLimit?: number;
  memoryLimit?: number;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

// Team related types
export interface TeamData {
  team_name: string;
  roll_nos: string[];
  emails: string[];
  year: number;
  members: string[];
  score?: number;
  rank?: number;
  created_at?: string;
}

// Authentication related types
export interface AuthData {
  username: string;
  password: string;
  email?: string;
}

// Round 2 Question types
export interface Round2QuestionData {
  _id?: string;
  description: string;
}

export interface Round2SubmissionTeam {
  _id: string;
  team_name: string;
  roll_nos: string[];
  members: string[];
}

export interface Round2Submission {
  _id: string;
  image_url: string[];
  github_link: string[];
  prompt_statements: string;
  tech_stack_used: string;
  team: Round2SubmissionTeam;
  createdAt: string;
  updatedAt: string;
}