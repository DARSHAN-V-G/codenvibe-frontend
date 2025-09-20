
# 🐛 Debugging Website Frontend

A modern React-based frontend for a competitive debugging platform where teams solve coding challenges by finding and fixing bugs.

## 🚀 Features

- **JWT Authentication**: Secure OTP-based login system
- **Protected Routes**: Route-level authentication protection
- **Real-time Code Editor**: Interactive debugging environment
- **Team Management**: Multi-member team support
- **Question Management**: Dynamic question loading from backend
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Hand-drawn style with smooth animations

## 🛠 Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Radix UI** for accessible components
- **JWT** for authentication

## 🔧 Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend server running

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file and update with your backend URL:
   ```
   VITE_BACKEND_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔐 Authentication Flow

1. User enters email address
2. System sends OTP to all team member emails
3. User enters OTP to verify identity
4. JWT token is issued and stored locally
5. Protected routes become accessible
6. Token is automatically validated on page refresh

## 🌐 API Integration

The frontend communicates with the backend through these endpoints:

- `POST /auth/request-login` - Request OTP
- `POST /auth/verify-otp` - Verify OTP and get JWT token
- `GET /question/getQuestion` - Get questions for user's year
- `GET /question/question/:id` - Get specific question details
- `POST /submission/submit` - Submit code for evaluation
  