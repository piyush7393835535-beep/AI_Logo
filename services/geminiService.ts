
import { GoogleGenAI, GenerateVideosOperationResponse } from "@google/genai";
import type { AspectRatio } from '../types';

const VEO_LOADING_MESSAGES = [
  "Warming up the animation studio...",
  "Casting your logo for the lead role...",
  "Our digital artists are sketching the first frames...",
  "Rendering the animation... this can take a minute.",
  "Adding the final touches and polish...",
  "Almost there, preparing for the premiere!",
];

export const generateLogo = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: `A professional, clean, vector-style logo for a company. The logo should be centered on a solid white background. Description: ${prompt}`,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio: '1:1',
    },
  });
  
  if (!response.generatedImages || response.generatedImages.length === 0) {
    throw new Error("Image generation failed to produce an image.");
  }

  const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
  return base64ImageBytes;
};

export const animateLogo = async (
  prompt: string,
  imageBase64: string,
  aspectRatio: AspectRatio,
  setLoadingMessage: (message: string) => void
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key has not been selected via the dialog.");
  }

  // IMPORTANT: Create a new instance right before the call to use the latest key from the selection dialog.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const mimeTypeMatch = imageBase64.match(/data:(image\/[a-zA-Z]+);base64,/);
  if (!mimeTypeMatch) {
    throw new Error("Invalid base64 image format");
  }
  const mimeType = mimeTypeMatch[1];
  const base64Data = imageBase64.split(',')[1];

  let currentMessageIndex = 0;
  setLoadingMessage(VEO_LOADING_MESSAGES[currentMessageIndex]);

  let operation: GenerateVideosOperationResponse = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || 'An elegant and dynamic animation of this logo.',
    image: {
      imageBytes: base64Data,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio,
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    currentMessageIndex = (currentMessageIndex + 1) % VEO_LOADING_MESSAGES.length;
    setLoadingMessage(VEO_LOADING_MESSAGES[currentMessageIndex]);
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  setLoadingMessage("Finalizing your video...");

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Video generation completed, but no download link was found.");
  }
  
  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!videoResponse.ok) {
    throw new Error(`Failed to download video: ${videoResponse.statusText}`);
  }

  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
};
