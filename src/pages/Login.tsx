import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiUser } from "react-icons/fi";
import loginBG from "/chat-bg1-copy.jpg";
import iskLogo from "/favicon-white.png";
import { addOrUpdateUser } from "../components/chatUtils";

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, resetEmail);
      if (!methods.includes("password")) {
        setError(
          "This email is not registered with Email/Password authentication."
        );
        setLoading(false);
        return;
      }
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess("Password reset email sent. Please check your inbox.");
      setError(null);
      setResetEmail("");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No account exists with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !displayName) {
      setError("Please enter a display name");
      return;
    }
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.includes("google.com")) {
        setError(
          "This email is registered with Google. Please use Google Sign In."
        );
        setLoading(false);
        return;
      }
      if (isSignUp && methods.includes("password")) {
        setError(
          "This email is already registered with Email/Password. Please sign in or use a different email."
        );
        setLoading(false);
        return;
      }

      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(userCredential.user, {
          displayName: displayName || email.split("@")[0],
        });
        await addOrUpdateUser(displayName || email.split("@")[0]);
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        await addOrUpdateUser(
          userCredential.user.displayName || email.split("@")[0]
        );
      }
      navigate("/chat");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError(
          "This email is already registered with Email/Password. Please sign in or use a different email."
        );
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError(
          "Too many failed attempts. Please try again later or reset your password."
        );
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("An error occurred during authentication. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleGoogleSignIn = async () => {
  //   setLoading(true);
  //   try {
  //     const provider = new GoogleAuthProvider();
  //     const result = await signInWithPopup(auth, provider);
  //     const email = result.user?.email;

  //     if (email) {
  //       const methods = await fetchSignInMethodsForEmail(auth, email);
  //       if (methods.includes("password")) {
  //         await signOut(auth);
  //         setError(
  //           "This email is registered with Email/Password. Please use Email Sign In instead."
  //         );
  //         setLoading(false);
  //         return;
  //       }
  //     }

  //     await addOrUpdateUser(
  //       result.user.displayName || email?.split("@")[0] || "User"
  //     );
  //     navigate("/chat");
  //   } catch (err: any) {
  //     if (err.code === "auth/account-exists-with-different-credential") {
  //       setError(
  //         "This email is registered with Email/Password. Please use Email Sign In instead."
  //       );
  //     } else if (err.code === "auth/popup-closed-by-user") {
  //       setError("Google Sign In was cancelled. Please try again.");
  //     } else if (err.code === "auth/cancelled-popup-request") {
  //       // Ignore this error
  //       setLoading(false);
  //       return;
  //     } else {
  //       setError("Failed to sign in with Google. Please try again.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  if (isForgotPassword) {
    return (
      <div
        className="min-h-screen w-screen bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center px-4"
        style={{
          backgroundImage: `url(${loginBG})`,
          backgroundSize: "300px",
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
        }}
      >
        <div className="bg-[#743fc9] w-full max-w-[400px] rounded-[10px] shadow-2xl p-4 sm:p-6">
          <div className="flex flex-col justify-center items-center mb-6">
            <img src={iskLogo} alt="isk chat logo" className="w-8 h-8 mb-2" />
            <p className="text-white text-lg font-semibold">Reset Password</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-800" />
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-2 bg-[whitesmoke]/40 rounded-lg focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-700/90 text-white py-2 rounded-lg hover:bg-neutral-800"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <button
            onClick={() => {
              setIsForgotPassword(false);
              setError(null);
              setResetSuccess(null);
            }}
            className="w-full text-white text-sm mt-4 hover:underline"
          >
            Back to Login
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {resetSuccess && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
              {resetSuccess}
            </div>
          )}
        </div>
      </div>
    );
  }

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
      <div className="bg-[#743fc9] w-full max-w-[400px] lg:max-w-[600px] lg:w-[35%] rounded-[10px] shadow-2xl p-4 sm:p-6 lg:p-8 sm:mx-auto transform transition-all">
        <div className="flex flex-col justify-center items-center">
          <img src={iskLogo} alt="isk chat logo" className="w-8 h-8 mb-2" />
          <p className="text-[clamp(12.5px,3vw,20px)] text-white mb-6 sm:mb-8 md:font-bold">
            {isSignUp ? "Create an account" : "ISK Chatroom"}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          {isSignUp && (
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-700" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
                className="w-full pl-10 pr-4 py-2 bg-[whitesmoke]/40 rounded-lg focus:outline-none placeholder:text-gray-600 placeholder:text-[clamp(13px,3vw,15px)]"
              />
            </div>
          )}
          <div>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-700" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-2 bg-[whitesmoke]/40 rounded-lg focus:outline-none placeholder:text-gray-600 placeholder:text-[clamp(13px,3vw,15px)]"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-700" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-4 py-2 bg-[whitesmoke]/40 rounded-lg focus:outline-none placeholder:text-gray-600 placeholder:text-[clamp(13px,3vw,15px)]"
              />
            </div>
            {!isSignUp && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setError(null);
                }}
                onMouseOver={(e) => (e.currentTarget.style.border = "none")}
                className="w-full text-white font-medium text-sm hover:underline text-right bg-inherit hover:outline-none mt-1"
              >
                Forgot Password?
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            onMouseOver={(e) => (e.currentTarget.style.border = "none")}
            className="w-full bg-neutral-700/90 text-white py-2 rounded-lg hover:bg-neutral-800 transition-colors duration-300"
          >
            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#743fc9] text-white">
              Or continue with
            </span>
          </div>
        </div> */}

        {/* <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[whitesmoke]/90 border border-neutral-200 text-neutral-900 py-2 rounded-lg hover:bg-neutral-50 transition-colors duration-300"
        >
          <FcGoogle className="text-xl" />
          <span>Google</span>
        </button> */}

        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
          }}
          onMouseOver={(e) => (e.currentTarget.style.border = "none")}
          className="w-full text-white text-sm mt-4 hover:underline bg-inherit font-medium focus:outline-none"
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
            <a
              className="text-neutral-300 hover:underline font-bold hover:text-neutral-800"
              onClick={()=> navigate("/terms")}
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              className="text-neutral-300 hover:underline font-bold hover:text-neutral-800"
              onClick={()=> navigate("/privacy")}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
