// src/pages/Login.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { sendPasswordReset } from '../components/chatUtils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await setPersistence(auth, browserLocalPersistence);
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/chat');
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', '').replace('auth/', '').replace(/-/g, ' '));
    }
  };

  const handlePasswordReset = async () => {
      if (!email) {
          setError("Please enter your email address to reset your password.");
          return;
      }
      setError('');
      setMessage('');
      try {
          await sendPasswordReset(email);
          setMessage("Password reset email sent! Please check your inbox.");
      } catch (err: any) {
          setError(err.message.replace('Firebase: ', ''));
      }
  };

  return (
    <div
      className="min-h-screen w-screen bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "url('/chat-bg1-copy.jpg')",
        backgroundSize: '300px',
        backgroundPosition: 'center center',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="bg-[#743fc9] w-full max-w-[400px] lg:max-w-[600px] lg:w-[35%] rounded-[10px] shadow-2xl p-4 sm:p-6 lg:p-8 sm:mx-auto transform transition-all">
        <div className="flex flex-col justify-center items-center">
          <img alt="isk chat logo" className="w-8 h-8 mb-2" src="/favicon-white.png" />
          <p className="text-[clamp(12.5px,3vw,20px)] text-white mb-6 sm:mb-8 md:font-bold">ISK Chatroom</p>
        </div>
        <form className="space-y-4 mb-6" onSubmit={handleAuth}>
          <div>
            <div className="relative">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-700" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-2 bg-[whitesmake]/40 rounded-lg focus:outline-none placeholder:text-gray-600 placeholder:text-[clamp(13px,3vw,15px)]"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-700" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                placeholder="Password"
                className="w-full pl-10 pr-4 py-2 bg-[whitesmoke]/40 rounded-lg focus:outline-none placeholder:text-gray-600 placeholder:text-[clamp(13px,3vw,15px)]"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {isLogin && (
              <button
                type="button"
                onClick={handlePasswordReset}
                className="w-full text-white font-medium text-sm hover:underline text-right bg-inherit hover:outline-none mt-1"
                style={{ border: 'none' }}
              >
                Forgot Password?
              </button>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-neutral-700/90 text-white py-2 rounded-lg hover:bg-neutral-800 transition-colors duration-300"
            style={{ border: 'none' }}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {error && <p className="text-sm text-center text-red-300 mb-4">{error}</p>}
        {message && <p className="text-sm text-center text-green-300 mb-4">{message}</p>}

        <button
          className="w-full text-white text-sm mt-4 hover:underline bg-inherit font-medium focus:outline-none"
          style={{ border: 'none' }}
          onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>

        <div className="mt-6 text-center text-xs text-white">
          <p>By signing in, you agree to our <br className="md:hidden" />
            <a href="/terms" className="text-neutral-300 hover:underline font-bold hover:text-neutral-800">Terms</a> and <a href="/privacy" className="text-neutral-300 hover:underline font-bold hover:text-neutral-800">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;