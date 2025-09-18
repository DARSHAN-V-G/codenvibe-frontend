const API_BASE_URL = 'http://localhost:4000'; // Adjust this to your backend URL

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for admin auth
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Admin Authentication
  async adminLogin(username, password) {
    return this.request('/admin/auth/login', {
      method: 'POST',
      body: { username, password },
    });
  }

  async adminLogout() {
    return this.request('/admin/auth/logout', {
      method: 'POST',
    });
  }

  async adminRegister(username, email, password) {
    return this.request('/admin/auth/register', {
      method: 'POST',
      body: { username, email, password },
    });
  }

  // Questions
  async getAllQuestions() {
    return this.request('/question/all');
  }

  async addQuestion(questionData) {
    return this.request('/question/add', {
      method: 'POST',
      body: questionData,
    });
  }

  async updateQuestion(id, questionData) {
    return this.request(`/question/update/${id}`, {
      method: 'PUT',
      body: questionData,
    });
  }

  async checkQuestion(id) {
    return this.request(`/question/check/${id}`, {
      method: 'POST',
    });
  }

  // Teams
  async getAllTeams() {
    return this.request('/admin/teams');
  }

  async addTeam(teamData) {
    return this.request('/admin/add-team', {
      method: 'POST',
      body: teamData,
    });
  }

  async removeTeam(teamName) {
    return this.request('/admin/remove-team', {
      method: 'DELETE',
      body: { team_name: teamName },
    });
  }

  // Note: Update team endpoint doesn't exist in API doc, but we'll assume it follows REST pattern
  async updateTeam(teamName, teamData) {
    return this.request('/admin/update-team', {
      method: 'PUT',
      body: { team_name: teamName, ...teamData },
    });
  }
}

export default new ApiService();