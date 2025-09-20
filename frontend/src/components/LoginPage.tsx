import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { requestOTP, login, error, clearError } = useAuth();

  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    console.log('🔐 LoginPage: Starting OTP request process for email:', email);
    setIsLoading(true);
    clearError();

    try {
      console.log('📧 LoginPage: Requesting OTP for email:', email);
      const response = await requestOTP(email);
      console.log('📧 LoginPage: OTP request response:', response);

      if (response.success) {
        setOtpSent(true);
        console.log('✅ LoginPage: OTP sent successfully, showing OTP input field');
        // Toast is already shown in AuthContext
      } else {
        console.log('❌ LoginPage: OTP request failed:', response.message);
        // Toast is already shown in AuthContext
      }
    } catch (err) {
      console.error('❌ LoginPage: Failed to send OTP:', err);
      // Toast is already shown in AuthContext
    } finally {
      setIsLoading(false);
      console.log('📧 LoginPage: OTP request process completed');
    }
  };

  const handleLogin = async () => {
    if (!email || !otp) {
      toast.error('Please enter both email and OTP');
      return;
    }

    console.log('🔐 LoginPage: Starting login process with email:', email, 'and OTP length:', otp.length);
    setIsLoading(true);
    clearError();

    try {
      console.log('🔐 LoginPage: Attempting login with email:', email, 'and OTP:', otp);
      const response = await login(email, otp);
      console.log('🔐 LoginPage: Login response received:', response);

      if (response.success && response.team) {
        console.log('✅ LoginPage: Login successful! Team:', response.team.team_name);
        console.log('✅ LoginPage: Calling onLogin callback to redirect user');
        onLogin();
      } else {
        console.log('❌ LoginPage: Login failed - response.success is false or no team data');
        // Toast is already shown in AuthContext
      }
    } catch (err) {
      console.error('❌ LoginPage: Login error:', err);
      // Toast is already shown in AuthContext
    } finally {
      setIsLoading(false);
      console.log('🔐 LoginPage: Login process completed');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative">
      {/* Background decorations removed per request (no animations) */}

      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border-2 border-black p-8 shadow-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1
              className="text-5xl font-bold mb-2"
              style={{ fontFamily: 'Patrick Hand, cursive' }}
            >
              Vibe n Code
            </h1>
            <p
              className="text-xl text-gray-600"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Debug • Compete • Vibe
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-black font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 border-2 border-black rounded-lg bg-white"
                placeholder="your.email@example.com"
                disabled={isLoading}
              />
            </div>

            {otpSent && (
              <div>
                <Label htmlFor="otp" className="text-black font-medium">
                  OTP (One-Time Password)
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-2 border-2 border-black rounded-lg bg-white"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {!otpSent ? (
                <Button
                  onClick={handleSendOTP}
                  disabled={isLoading || !email}
                  className="w-full py-3 px-7 border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                  style={{ fontFamily: 'Patrick Hand, cursive' }}
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </Button>
              ) : (
                <Button
                  onClick={handleLogin}
                  disabled={isLoading || !email || !otp}
                  className="w-full py-3 px-7 border-2 border-black bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  style={{ fontFamily: 'Patrick Hand, cursive' }}
                >
                  {isLoading ? 'Logging in...' : 'Login to Play'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}