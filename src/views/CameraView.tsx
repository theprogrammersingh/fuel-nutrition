import React, { useState, useRef, useEffect } from 'react';
import { GeminiInferenceResult } from '../types';
import { analyzeMealImage } from '../services/gemini';
import { getSettings } from '../services/storage';

interface CameraViewProps {
  onCancel: () => void;
  onScanComplete: (imageSrc: string, result: GeminiInferenceResult) => void;
}

const SAMPLE_DEMO_PHOTOS = [
  {
    title: 'Paneer Bhurji & Rotis',
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Grilled Chicken & Greens',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Avocado Toast & Eggs',
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
  },
];

export const CameraView: React.FC<CameraViewProps> = ({ onCancel, onScanComplete }) => {
  const [streamActive, setStreamActive] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Position meal inside frame');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const settings = getSettings();

  // Initialize camera stream if available
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
            audio: false,
          });
          currentStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setStreamActive(true);
          }
        }
      } catch (err) {
        console.info('Live video camera not accessible directly; file upload fallback active', err);
        setStreamActive(false);
      }
    }

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCaptureFromVideo = async () => {
    if (!videoRef.current || !streamActive) {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPreviewImage(dataUrl);
    processImage(dataUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewImage(dataUrl);
      processImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sampleUrl: string) => {
    setPreviewImage(sampleUrl);
    processImage(sampleUrl);
  };

  const processImage = async (imageSrc: string) => {
    setIsAnalyzing(true);
    setStatusMessage('Analyzing plate geometry & portion density...');

    try {
      const result = await analyzeMealImage(imageSrc, 'image/jpeg');
      setIsAnalyzing(false);
      onScanComplete(imageSrc, result);
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
      setStatusMessage('Error analyzing photo. Try another image.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none">
      {/* Hidden File Input for Native Camera or Gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top HUD Controls */}
      <div className="pt-safe px-gutter z-20 flex items-center justify-between text-white bg-gradient-to-b from-black/70 to-transparent pb-4">
        <button
          onClick={onCancel}
          aria-label="Cancel scan"
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Gemini Engine Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/10 text-xs">
          <span className="material-symbols-outlined text-[15px] text-accent-success">
            smart_toy
          </span>
          <span className="font-medium tracking-tight font-sans">
            {settings.selectedModel}
          </span>
          <span className="text-white/40">·</span>
          <span className="text-accent-success font-mono">1.4s</span>
        </div>

        <button
          onClick={() => setFlashOn(!flashOn)}
          aria-label="Toggle flash simulation"
          className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform ${
            flashOn ? 'bg-amber-400 text-black' : 'bg-white/20 text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {flashOn ? 'flash_on' : 'flash_off'}
          </span>
        </button>
      </div>

      {/* Central Viewfinder Area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden px-4">
        {/* Flash overlay animation */}
        {flashOn && (
          <div className="absolute inset-0 bg-white/15 pointer-events-none z-10"></div>
        )}

        <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/20 shadow-2xl flex items-center justify-center">
          {previewImage ? (
            <img src={previewImage} alt="Captured food" className="w-full h-full object-cover" />
          ) : streamActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 text-white/70 gap-3">
              <span className="material-symbols-outlined text-[48px] text-white/40">
                photo_camera
              </span>
              <span className="font-medium text-sm">Camera preview ready</span>
              <p className="text-xs text-white/50 max-w-[200px]">
                Tap the shutter below or upload a photo from your gallery.
              </p>
            </div>
          )}

          {/* Corner Framing Brackets */}
          <div className="absolute inset-4 pointer-events-none flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-6 h-6 border-t-2 border-l-2 border-white/80 rounded-tl-sm"></div>
              <div className="w-6 h-6 border-t-2 border-r-2 border-white/80 rounded-tr-sm"></div>
            </div>
            <div className="flex justify-between">
              <div className="w-6 h-6 border-b-2 border-l-2 border-white/80 rounded-bl-sm"></div>
              <div className="w-6 h-6 border-b-2 border-r-2 border-white/80 rounded-br-sm"></div>
            </div>
          </div>

          {/* AI Scanning Beam */}
          {isAnalyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-xs z-30">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-accent-success to-transparent animate-pulse absolute top-1/2"></div>
              <div className="flex flex-col items-center gap-2 p-4 bg-zinc-900/90 rounded-xl border border-white/10 shadow-xl text-center">
                <span className="material-symbols-outlined text-accent-success text-[28px] animate-spin">
                  progress_activity
                </span>
                <span className="font-label-xs text-label-xs text-white uppercase tracking-wider">
                  Vision Engine Active
                </span>
                <p className="font-mono-data text-xs text-white/80 max-w-[220px]">
                  {statusMessage}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="pb-safe px-gutter z-20 flex flex-col gap-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-4">
        {/* Sample Demo Meals Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="font-label-xs text-[11px] text-white/50 uppercase tracking-wider text-center">
            Quick Test Dishes
          </span>
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
            {SAMPLE_DEMO_PHOTOS.map((sample, i) => (
              <button
                key={i}
                disabled={isAnalyzing}
                onClick={() => handleSelectSample(sample.url)}
                className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-medium backdrop-blur-md border border-white/10 whitespace-nowrap active:scale-95 transition-all"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Shutter / Capture Row */}
        <div className="flex items-center justify-around py-2">
          {/* Gallery / File Picker */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            aria-label="Upload from gallery"
            className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex flex-col items-center justify-center text-white text-[10px] active:scale-95 transition-all hover:bg-white/25"
          >
            <span className="material-symbols-outlined text-[20px]">photo_library</span>
          </button>

          {/* Shutter Button */}
          <button
            onClick={handleCaptureFromVideo}
            disabled={isAnalyzing}
            aria-label="Capture photo"
            className="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 rounded-full bg-white hover:bg-zinc-200 transition-colors"></div>
          </button>

          {/* Cancel */}
          <button
            onClick={onCancel}
            disabled={isAnalyzing}
            aria-label="Cancel"
            className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex flex-col items-center justify-center text-white text-[10px] active:scale-95 transition-all hover:bg-white/25"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
