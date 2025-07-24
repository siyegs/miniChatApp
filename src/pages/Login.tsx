import { useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock } from "react-icons/fi";
import loginBG from "/chat-bg1-copy.jpg";
import iskLogo from "/favicon-white.png";

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/chat");
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      if (auth.currentUser) {
        navigate("/chat");
      } else {
        setError("Login failed, no user session");
      }
    } catch (err) {
      setError("There was an error signing in with Google");
    }
  };

  return (
    <div
      className="min-h-screen w-screen bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url(${loginBG})`,
        backgroundSize: "300px",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
      }}
    >
      <div className="bg-[#743fc9] w-full max-md:w-[90%] max-w-[400px] lg:max-w-[600px] lg:w-[35%] rounded-lg shadow-2xl p-4 sm:p-6 lg:p-8 mx-4 sm:mx-auto transform transition-all">
        <div className="flex flex-col justify-center items-center">
          <img src={iskLogo} alt="" className="w-8 h-8 mb-2" />
          <p className="text-[clamp(12.5px,3vw,23px)] text-white mb-6 sm:mb-8">
            {isSignUp ? "Create an account" : "Sign in to ISK chatroom!"}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          <div>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-2 bg-[whitesmoke]/90 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-4 py-2 bg-[whitesmoke]/90 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 text-white py-2 rounded-lg hover:bg-neutral-800 transition-colors duration-300"
          >
            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#743fc9] text-white">
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-[whitesmoke]/90 border border-neutral-200 text-neutral-900 py-2 rounded-lg hover:bg-neutral-50 transition-colors duration-300"
        >
          <FcGoogle className="text-xl" />
          <span>Google</span>
        </button>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-white text-sm mt-4 hover:underline"
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center text-sm animate-fade-in">
            {error}
          </div>
        )}

        <div className="mt-6 text-center text-xs text-white">
          <p>
            By signing in, you agree to our <br className="md:hidden" />
            <a href="#" className="text-neutral-300 hover:underline font-bold">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-neutral-300 hover:underline font-bold">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
