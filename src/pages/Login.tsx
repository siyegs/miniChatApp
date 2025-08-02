import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  updateProfile, // <-- Import updateProfile
} from 'firebase/auth';
import { sendPasswordReset, addOrUpdateUser } from '../components/chatUtils'; // <-- Import addOrUpdateUser
import { usePWA } from '../context/PWAContext';
import { FiDownload, FiUser, FiLock, FiMail } from 'react-icons/fi';

const Login = () => {
  const { installPrompt, handleInstall } = usePWA();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); // <-- State for display name
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await setPersistence(auth, browserLocalPersistence);
      setIsLoading(true)
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Sign up logic
        if (!displayName.trim()) {
            setError("Display name cannot be empty.");
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // **THE FIX**: Update the new user's profile with the display name
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: displayName.trim(),
          });
          // Also create their document in Firestore immediately
          await addOrUpdateUser(displayName.trim());
        }
      }
      navigate('/chat');
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', '').replace('auth/', '').replace(/-/g, ' '));
    }
    setIsLoading(false);
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
          {/* **THE FIX**: Display Name field for Sign Up */}
          {!isLogin && (
            <div>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-700" />
                <input
                  placeholder="Display Name"
                  className="w-full pl-10 pr-4 py-2 bg-[whitesmoke]/40 rounded-lg focus:outline-none placeholder:text-gray-600 placeholder:text-[clamp(13px,3vw,15px)]"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
          <div>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-700" />
              <input
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-2 bg-[whitesmoke]/40 rounded-lg focus:outline-none placeholder:text-gray-600 placeholder:text-[clamp(13px,3vw,15px)]"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-700" />
              <input
                placeholder="Password"
                className="w-full pl-10 pr-4 py-2 bg-[whitesmoke]/40 rounded-lg focus:outline-none placeholder:text-gray-600 placeholder:text-[clamp(13px,3vw,15px)]"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
            {isLogin ? (isLoading ? 'Signing in...' : 'Sign In') : (isLoading ? 'Creating...' : 'Create Account')}
          </button>
        </form>

        {error && <p className="text-sm text-center text-red-300 mb-4">{error}</p>}
        {message && <p className="text-sm text-center text-green-300 mb-4">{message}</p>}

        <button
          className="w-full text-white text-sm mt-4 hover:underline bg-inherit font-medium focus:outline-none"
          style={{ border: 'none' }}
          onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); setDisplayName(''); }}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>

        <div className="mt-6 text-center text-xs text-white">
          <p>By signing in, you agree to our <br className="md:hidden" />
            <a href="/terms" className="text-neutral-300 hover:underline font-bold hover:text-neutral-800">Terms</a> and <a href="/privacy" className="text-neutral-300 hover:underline font-bold hover:text-neutral-800">Privacy Policy</a>
          </p>
        </div>
      </div>
      
      {installPrompt && (
        <button
          onClick={handleInstall}
          title="Install App"
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-full shadow-lg hover:bg-purple-700 transition-transform hover:scale-105 animate-fade-in"
          style={{ border: 'none' }}
        >
          <FiDownload />
          <span>Install App</span>
        </button>
      )}
    </div>
  );
};

export default Login;