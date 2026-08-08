import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Building2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Notification } from '../ui/Notification';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleDashboard } from '../ProtectedRoute';

export const Login: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error',
    message: ''
  });

  // If user is already logged in, redirect them to their dashboard
  // This prevents session conflicts when opening a new tab
  React.useEffect(() => {
    if (user) {
      navigate(getRoleDashboard(user.role), { replace: true });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const loggedInUser = await login(formData);
      setNotification({
        show: true,
        type: 'success',
        message: 'Login successful! Redirecting...'
      });
      // Centralized role-based redirect — one place, no scattered if/else
      navigate(getRoleDashboard(loggedInUser.role));
    } catch (error: any) {
      setNotification({
        show: true,
        type: 'error',
        message: error.message || 'Login failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen relative flex items-center justify-center lg:justify-between lg:px-24 overflow-hidden">
      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/banner.jpeg"
          alt="Construction Banner"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-slate-900/60 to-slate-900/80"></div>
      </div>

      {/* Left side catchy text - hidden on mobile */}
      <div className="hidden lg:flex flex-col relative z-10 max-w-2xl text-white">
        <div className="w-20 h-1.5 bg-blue-500 mb-8 rounded-full shadow-lg shadow-blue-500/50"></div>
        <h1 className="text-6xl font-extrabold mb-6 leading-tight drop-shadow-xl tracking-tight">
          Build with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Precision.</span><br />
          Manage with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Ease.</span>
        </h1>
        <p className="text-xl text-gray-300 drop-shadow-md leading-relaxed font-light max-w-lg">
          Welcome to Urban Design Construction. The ultimate platform to streamline your projects, contractors, and financial workflows.
        </p>
      </div>

      {/* Login Card (Glassmorphism) */}
      <div className="w-full max-w-md relative z-10 m-4">
        {/* Glass effect background */}
        <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/50"></div>

        <div className="relative z-20 p-8 lg:p-10">
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="bg-white p-3 rounded-full shadow-md mb-6 border border-gray-100">
              <img src="/logo.png" alt="Urban Design Logo" className="h-20 w-auto object-contain" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Please sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={errors.email}
              placeholder="Enter your email"
              icon={<Mail className="w-5 h-5" />}
              className="bg-slate-50/50 border-slate-200 focus:bg-white hover:bg-slate-50 transition-all rounded-xl"
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              placeholder="Enter your password"
              icon={<Lock className="w-5 h-5" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              className="bg-slate-50/50 border-slate-200 focus:bg-white hover:bg-slate-50 transition-all rounded-xl"
              required
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full h-12 rounded-xl text-lg font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
              size="lg"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>

      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};