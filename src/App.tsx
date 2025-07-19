import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Chat from './pages/Chat';
import { auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import React from 'react';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
  if (loading) return null; // or a loading spinner
  return user ? children : <Navigate to="/" replace />;
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;