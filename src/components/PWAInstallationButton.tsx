// src/components/PWAInstallButton.tsx

//import React from 'react';
import { usePWA } from '../context/PWAContext';
import { FiDownload } from 'react-icons/fi';

const PWAInstallButton = () => {
  const { installPrompt, handleInstall } = usePWA();

  // If the install prompt isn't available, render nothing
  if (!installPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstall}
      title="Install App"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-full shadow-lg hover:bg-purple-700 transition-transform hover:scale-105 animate-fade-in"
    >
      <FiDownload />
      <span>Install App</span>
    </button>
  );
};

export default PWAInstallButton;