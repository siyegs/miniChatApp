import { useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
    <div className="min-h-screen w-screen bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="bg-white w-full max-w-[400px] lg:max-w-[600px] lg:w-[35%] rounded-lg shadow-2xl p-4 sm:p-6 lg:p-8 mx-4 sm:mx-auto transform transition-all hover:scale-105">
        <div className="text-center">
          <h1 className="text-[clamp(1rem,6.2vw,2.1rem)] font-bold text-neutral-900 mb-2">
            Welcome
          </h1>
          <p className="text-sm text-neutral-600 mb-6 sm:mb-8">
            Sign in to be part of ISK chatroom!
          </p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-fit mx-auto flex items-center justify-center gap-2 sm:gap-3 bg-white border-2 border-neutral-200 text-neutral-900 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-neutral-50 hover:shadow-md transition-all duration-300"
        >
          <FcGoogle className="text-xl sm:text-2xl" />
          <span>Continue with Google</span>
        </button>

        {error && (
          <div className="mt-4 p-2 sm:p-3 bg-neutral-100 text-neutral-800 rounded-lg text-center text-sm sm:text-base border border-neutral-200 animate-fade-in">
            {error}
          </div>
        )}

        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-neutral-500">
          <p>
            By signing in, you agree to our{" "}
            <a href="#" className="text-neutral-700 hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-neutral-700 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
