
import React, { useState } from 'react';
import { animateLogo } from '../services/geminiService';
import { ApiKeySelector } from './ApiKeySelector';
import type { AspectRatio } from '../types';

const FilmIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2"/><line x1="7" x2="7" y1="3" y2="21"/><line x1="17" x2="17" y1="3" y2="21"/><line x1="3" x2="21" y1="7" y2="7"/><line x1="3" x2="21" y1="17" y2="17"/>
  </svg>
);

const ArrowLeftIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);


interface VideoAnimatorProps {
  logoImage: string;
  onAnimationComplete: (videoUrl: string) => void;
  onBack: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  setError: (error: string | null) => void;
}

export const VideoAnimator: React.FC<VideoAnimatorProps> = ({
  logoImage,
  onAnimationComplete,
  onBack,
  setIsLoading,
  setLoadingMessage,
  setError,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [currentImage, setCurrentImage] = useState<string>(logoImage);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (resetKey: () => void) => async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const videoUrl = await animateLogo(prompt, currentImage, aspectRatio, setLoadingMessage);
      onAnimationComplete(videoUrl);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during video generation.';
      setError(errorMessage);
      if (errorMessage.includes("Requested entity was not found.")) {
        setError("Your API key was not found. Please select a valid key and try again.");
        resetKey();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-800/50 rounded-2xl shadow-2xl relative">
       <button onClick={onBack} className="absolute top-4 left-4 flex items-center text-gray-400 hover:text-white transition">
         <ArrowLeftIcon className="w-5 h-5 mr-1" />
         Back
       </button>

      <div className="grid md:grid-cols-2 gap-8 items-center pt-8">
        <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded-lg aspect-square p-4 border border-gray-700">
           <img src={currentImage} alt="Logo to animate" className="max-w-full max-h-full object-contain rounded-md" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1">Step 2: Animate Your Logo</h2>
          <p className="text-gray-400 mb-4">Bring your logo to life with a short animation.</p>

          <ApiKeySelector>
            {(resetKey) => (
              <form onSubmit={handleSubmit(resetKey)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="upload" className="block text-sm font-medium text-gray-300">
                    Use a different image?
                  </label>
                  <input
                    id="upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600/30 file:text-indigo-300 hover:file:bg-indigo-600/50 cursor-pointer"
                  />
                </div>
                
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Optional: Describe the animation (e.g., logo materializes from sparkling dust)."
                  className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['16:9', '9:16'] as AspectRatio[]).map(ratio => (
                            <label key={ratio} className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${aspectRatio === ratio ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                <input
                                    type="radio"
                                    name="aspectRatio"
                                    value={ratio}
                                    checked={aspectRatio === ratio}
                                    onChange={() => setAspectRatio(ratio)}
                                    className="sr-only"
                                />
                                {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                            </label>
                        ))}
                    </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <FilmIcon className="w-5 h-5 mr-2" />
                  Animate Logo
                </button>
              </form>
            )}
          </ApiKeySelector>
        </div>
      </div>
    </div>
  );
};
