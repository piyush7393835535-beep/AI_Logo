
import React, { useState } from 'react';
import { generateLogo } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

const SparklesIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6-10.375A1 1 0 0 1 3.437 2.5l10.375 6a2 2 0 0 0 1.437 1.437l6 10.375a1 1 0 0 1-1.125 1.563l-10.375-6Z"/><path d="M20 3 17 6"/><path d="m14 8 3-3"/><path d="M12.5 15.5 10 13"/>
    </svg>
);


interface LogoGeneratorProps {
  onLogoGenerated: (imageBase64: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const LogoGenerator: React.FC<LogoGeneratorProps> = ({ onLogoGenerated, setIsLoading, setError }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a description for your logo.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setLocalLoading(true);
    setGeneratedImage(null);

    try {
      const imageBase64 = await generateLogo(prompt);
      setGeneratedImage(`data:image/png;base64,${imageBase64}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
      setGeneratedImage(null);
    } finally {
      setIsLoading(false);
      setLocalLoading(false);
    }
  };
  
  const handleConfirmLogo = () => {
    if (generatedImage) {
        const base64Data = generatedImage.split(',')[1];
        onLogoGenerated(base64Data);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-800/50 rounded-2xl shadow-2xl">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">Step 1: Design Your Logo</h2>
          <p className="text-gray-400 mb-4">Describe your company and the logo you envision.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A minimalist logo for 'EcoBloom', a sustainable plant company, featuring a leaf and a water drop."
              className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              disabled={localLoading}
            />
            <button
              type="submit"
              disabled={localLoading}
              className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {localLoading ? 'Generating...' : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Generate Logo
                </>
              )}
            </button>
          </form>
        </div>

        <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded-lg aspect-square p-4 border border-gray-700">
          {localLoading && <LoadingSpinner />}
          {!localLoading && generatedImage && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <img src={generatedImage} alt="Generated logo" className="max-w-full max-h-[70%] object-contain rounded-md" />
                <button
                    onClick={handleConfirmLogo}
                    className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-500 transition-transform duration-200 transform hover:scale-105 shadow-lg"
                >
                    Animate This Logo
                </button>
            </div>
          )}
          {!localLoading && !generatedImage && (
            <div className="text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1m6-3l-2-2m-2-2l-1-1m-2-2l-2-2m4 4l2 2m-4-4l-2-2m2 2l-2 2" /></svg>
              <p>Your generated logo will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
