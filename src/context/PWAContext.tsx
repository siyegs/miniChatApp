// src/context/PWAContext.tsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react'; // <-- THE FIX IS HERE

// Define the shape of the context data
interface PWAContextType {
  installPrompt: any | null;
  handleInstall: () => void;
}

// Create the context
const PWAContext = createContext<PWAContextType | undefined>(undefined);

// Create the Provider component
export const PWAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // This event is fired by the browser when the app is installable
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault(); // Prevent the browser's default mini-infobar
      setInstallPrompt(event); // Save the event so we can trigger it manually
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup listener when the component unmounts
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    
    // Show the browser's installation prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    await installPrompt.userChoice;
    
    // The prompt can only be used once, so we clear it
    setInstallPrompt(null);
  };

  return (
    <PWAContext.Provider value={{ installPrompt, handleInstall }}>
      {children}
    </PWAContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const usePWA = () => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};