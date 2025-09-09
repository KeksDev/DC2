'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserPlus, LogIn, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let success = false;
      if (isLogin) {
        success = await login(formData.username, formData.password);
      } else {
        success = await register(formData.username, formData.email, formData.password);
      }

      if (!success) {
        setError(isLogin ? 'Invalid credentials' : 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-dark-bg rounded-xl p-8 w-full max-w-md shadow-2xl"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-privacy mr-2" />
            <h1 className="text-3xl font-bold text-text-primary">DC2</h1>
          </div>
          <p className="text-text-secondary">Privacy-Focused Communication</p>
        </motion.div>

        {/* Tab Buttons */}
        <div className="flex mb-6 bg-light-bg rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all duration-200 ${
              isLogin
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all duration-200 ${
              !isLogin
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Register
          </button>
        </div>

        {/* Form */}
        <motion.form
          key={isLogin ? 'login' : 'register'}
          initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label htmlFor="username" className="block text-text-secondary text-sm font-medium mb-2">
              {isLogin ? 'Username or Email' : 'Username'}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-light-bg border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              placeholder={isLogin ? 'Enter username or email' : 'Choose a username'}
            />
          </div>

          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label htmlFor="email" className="block text-text-secondary text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-light-bg border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
              />
            </motion.div>
          )}

          <div>
            <label htmlFor="password" className="block text-text-secondary text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-light-bg border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-privacy/10 border border-privacy/30 p-4 rounded-lg"
            >
              <div className="flex items-start">
                <Info className="w-4 h-4 text-privacy mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-text-secondary">
                  Your data is encrypted and we prioritize your privacy. Messages are automatically deleted after 30 days.
                </p>
              </div>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                {isLogin ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                {isLogin ? 'Login' : 'Register'}
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}