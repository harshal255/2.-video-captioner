import React, { useState, useEffect } from 'react';
import VideoUpload from './VideoUpload';
import ExtractionSettings from './ExtractionSettings';
import FrameGallery from './FrameGallery';
import AdBanner from './AdBanner';
import { extractVideoFrames, type ExtractionOptions, type ExtractedFrame } from '../utils/videoExtractor';
import toast, { Toaster } from 'react-hot-toast';

export default function VideoFrameExtractorApp() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);

  // Trimmer states
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // Extraction options
  const [options, setOptions] = useState<ExtractionOptions>({
    mode: 'count',
    value: 10,
    format: 'image/jpeg',
    quality: 0.95,
    maxDimension: 0, // Original resolution
  });

  const handleVideoSelected = (file: File) => {
    setSelectedFile(file);
    setFrames([]);
    setTrimStart(0);
    setTrimEnd(0);
    toast.success("Video loaded! Adjust parameters and click Extract Frames.");
  };

  const handleVideoCleared = () => {
    setSelectedFile(null);
    setFrames([]);
    setTrimStart(0);
    setTrimEnd(0);
    setProgressText(null);
  };

  const handleTrimChange = (start: number, end: number) => {
    setTrimStart(start);
    setTrimEnd(end);
  };

  const handleExtractFrames = async () => {
    if (!selectedFile) {
      toast.error("Please upload a video file first.");
      return;
    }

    setIsProcessing(true);
    setFrames([]);
    const toastId = toast.loading("Extracting keyframes from video...");

    try {
      const extracted = await extractVideoFrames(
        selectedFile,
        {
          ...options,
          startTimestamp: trimStart,
          endTimestamp: trimEnd
        },
        (current, total) => {
          setProgressText(`Extracting frame ${current} of ${total}...`);
        }
      );

      setFrames(extracted);
      toast.success(`Successfully extracted ${extracted.length} keyframes!`, { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to extract frames from video.", { id: toastId });
    } finally {
      setIsProcessing(false);
      setProgressText(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#09090b', color: '#f4f4f5', border: '1px solid #27272a' } }} />

      {/* Main Grid: Upload & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Upload & Video Player */}
        <div className="flex flex-col gap-4">
          <VideoUpload
            onVideoSelected={handleVideoSelected}
            onVideoCleared={handleVideoCleared}
            selectedFile={selectedFile}
            trimStart={trimStart}
            trimEnd={trimEnd}
            onTrimChange={handleTrimChange}
          />
        </div>

        {/* Right Column: Dynamic Parameter Settings */}
        <div className="flex flex-col gap-4">
          <ExtractionSettings
            options={options}
            onChange={setOptions}
            onExtract={handleExtractFrames}
            isProcessing={isProcessing}
            disabled={!selectedFile}
          />
        </div>
      </div>

      {/* In-content AdSense Slot */}
      <AdBanner slot="1234567890" label="Sponsor Advertisement" className="my-2" />

      {/* Extraction Progress Indicator */}
      {isProcessing && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 flex items-center justify-center gap-3 animate-pulse">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-semibold">{progressText || 'Extracting video frames...'}</span>
        </div>
      )}

      {/* Frame Gallery & Storyboard Export */}
      {frames.length > 0 && (
        <FrameGallery
          frames={frames}
          videoFileName={selectedFile?.name || 'video'}
        />
      )}
    </div>
  );
}
