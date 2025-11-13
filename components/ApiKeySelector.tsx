import React, { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// Fix: Use a named interface 'AIStudio' to avoid declaration conflicts for window.aistudio.
// This aligns with the error message indicating the property should be of type 'AIStudio'.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    AIstudio: AIStudio;
  }
}

interface ApiKeySelectorProps {
  children: (resetKey: () => void) => React.ReactNode;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ children }) => {
  const [isKeySelected, setIsKeySelected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  const checkKey = useCallback(async () => {
    setIsChecking(true);
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setIsKeySelected(hasKey);
    } else {
      // Fallback for local development or if script fails to load
      setIsKeySelected(!!process.env.API_KEY);
    }
    setIsChecking(false);
  }, []);

  const selectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Optimistically assume key selection is successful to avoid race conditions.
      setIsKeySelected(true);
    } else {
      alert("API key selection is not available in this environment.");
    }
  };
  
  const resetKey = useCallback(() => {
    setIsKeySelected(false);
  }, []);

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-64">
        <LoadingSpinner />
        <p className="mt-4 text-gray-400">Verifying API key status...</p>
      </div>
    );
  }

  if (!isKeySelected) {
    return (
      <div className="bg-gray-800/50 p-8 rounded-lg text-center flex flex-col items-center gap-4">
        <h3 className="text-2xl font-bold text-white">Veo API Key Required</h3>
        <p className="text-gray-300 max-w-md">
          To generate videos with Veo, you need to select an API key. This will be used for billing purposes.
        </p>
        <p className="text-sm text-gray-400">
          For more information, please visit the{' '}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
            billing documentation
          </a>.
        </p>
        <button
          onClick={selectKey}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-500 transition-transform duration-200 transform hover:scale-105"
        >
          Select API Key
        </button>
      </div>
    );
  }

  return <>{children(resetKey)}</>;
};
