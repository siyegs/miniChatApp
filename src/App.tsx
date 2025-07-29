import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import React, { useEffect } from "react";
import iskLogo from "/favicon-white.png";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      localStorage.setItem("lastActive", Date.now().toString());
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-neutral-900">
        <img
          src={iskLogo}
          alt="Loading..."
          className="w-16 h-16 animate-pulse"
        />
        <h2 className="font-extrabold pt-3 animate-pulse">ISK Chat Room</h2>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/chat"
          element={
            <RequireAuth>
              <Chat />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
