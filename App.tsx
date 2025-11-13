
import React, { useState } from 'react';
import { LogoGenerator } from './components/LogoGenerator';
import { VideoAnimator } from './components/VideoAnimator';
import { LoadingSpinner } from './components/LoadingSpinner';
import type { AppStep } from './types';

const Header: React.FC = () => (
  <header className="text-center p-4 md:p-6">
    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
      Logo Animator AI
    </h1>
    <p className="text-gray-400 mt-2 text-lg">From Concept to Animation in Two Simple Steps</p>
  </header>
);

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('GENERATE_LOGO');
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleLogoGenerated = (imageBase64: string) => {
    setLogoImage(`data:image/png;base64,${imageBase64}`);
    setStep('ANIMATE_LOGO');
    setError(null);
  };

  const handleAnimationComplete = (url: string) => {
    setVideoUrl(url);
    setError(null);
  };
  
  const handleBack = () => {
    setStep('GENERATE_LOGO');
    setLogoImage(null);
  };

  const handleStartOver = () => {
    setStep('GENERATE_LOGO');
    setLogoImage(null);
    setVideoUrl(null);
    setError(null);
    setIsLoading(false);
    setLoadingMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4">
      <Header />
      <main className="w-full max-w-6xl mx-auto flex-grow">
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-6 text-center">
            <p className="font-bold">An Error Occurred</p>
            <p>{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <LoadingSpinner />
            <p className="text-xl mt-4 text-gray-300 animate-pulse">{loadingMessage}</p>
          </div>
        )}

        {videoUrl ? (
          <div className="flex flex-col items-center gap-6 p-6 bg-gray-800/50 rounded-2xl shadow-2xl">
            <h2 className="text-3xl font-bold text-center">Your Animated Logo is Ready!</h2>
            <video src={videoUrl} controls autoPlay loop className="w-full max-w-2xl rounded-lg shadow-lg border-2 border-purple-500" />
            <button
              onClick={handleStartOver}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-500 transition-transform duration-200 transform hover:scale-105 shadow-lg"
            >
              Create Another
            </button>
          </div>
        ) : (
          <>
            {step === 'GENERATE_LOGO' && (
              <LogoGenerator
                onLogoGenerated={handleLogoGenerated}
                setIsLoading={(val) => {
                  setIsLoading(val);
                  if (val) setLoadingMessage('Generating your unique logo...');
                }}
                setError={setError}
              />
            )}
            {step === 'ANIMATE_LOGO' && logoImage && (
              <VideoAnimator
                logoImage={logoImage}
                onAnimationComplete={handleAnimationComplete}
                onBack={handleBack}
                setIsLoading={setIsLoading}
                setLoadingMessage={setLoadingMessage}
                setError={setError}
              />
            )}
          </>
        )}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        Powered by Google Gemini
      </footer>
    </div>
  );
};

export default App;
