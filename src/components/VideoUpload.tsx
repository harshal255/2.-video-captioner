"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, Video, X, Film, Play, Pause, Volume2, VolumeX, Scissors, Download } from "lucide-react";
import toast from "react-hot-toast";

interface VideoUploadProps {
  onVideoSelected: (file: File) => void;
  onVideoCleared: () => void;
  selectedFile: File | null;
  isProcessing: boolean;
  trimStart: number;
  trimEnd: number;
  onTrimChange: (start: number, end: number) => void;
  onApplyTrim: () => void;
}

export default function VideoUpload({
  onVideoSelected,
  onVideoCleared,
  selectedFile,
  isProcessing,
  trimStart,
  trimEnd,
  onTrimChange,
  onApplyTrim
}: VideoUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  // Custom video player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Live frame preview states
  const [startFrameImg, setStartFrameImg] = useState<string | null>(null);
  const [endFrameImg, setEndFrameImg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startVideoRef = useRef<HTMLVideoElement>(null);
  const endVideoRef = useRef<HTMLVideoElement>(null);

  // Safely manage object URLs to prevent memory leaks
  useEffect(() => {
    if (!selectedFile) {
      setVideoSrc(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setStartFrameImg(null);
      setEndFrameImg(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setVideoSrc(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  // Update start frame preview when trimStart changes
  useEffect(() => {
    const video = startVideoRef.current;
    if (!video || !videoSrc) return;

    const captureFrame = () => {
      const canvas = document.createElement("canvas");
      // Use video's natural dimensions to preserve exact aspect ratio
      canvas.width = video.videoWidth || 160;
      canvas.height = video.videoHeight || 90;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setStartFrameImg(canvas.toDataURL("image/jpeg", 0.85));
      }
    };

    const handleSeeked = () => {
      captureFrame();
    };

    const handleLoadedData = () => {
      captureFrame();
    };

    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("loadedmetadata", handleLoadedData);

    // Seek
    video.currentTime = trimStart;

    // Capture immediately if video data is already available
    if (video.readyState >= 2) {
      captureFrame();
    }

    return () => {
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("loadedmetadata", handleLoadedData);
    };
  }, [trimStart, videoSrc]);

  // Update end frame preview when trimEnd changes
  useEffect(() => {
    const video = endVideoRef.current;
    if (!video || !videoSrc) return;

    const captureFrame = () => {
      const canvas = document.createElement("canvas");
      // Use video's natural dimensions to preserve exact aspect ratio
      canvas.width = video.videoWidth || 160;
      canvas.height = video.videoHeight || 90;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setEndFrameImg(canvas.toDataURL("image/jpeg", 0.85));
      }
    };

    const handleSeeked = () => {
      captureFrame();
    };

    const handleLoadedData = () => {
      video.currentTime = trimEnd;
    };

    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("loadedmetadata", handleLoadedData);

    // Seek
    video.currentTime = trimEnd;

    // Capture immediately if video data is already available
    if (video.readyState >= 2) {
      captureFrame();
    }

    return () => {
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("loadedmetadata", handleLoadedData);
    };
  }, [trimEnd, videoSrc]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        onVideoSelected(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onVideoSelected(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Custom Video Player Controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(err => console.log("Playback interrupted:", err));
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent play/pause trigger when clicking mute
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    if (trimEnd > 0 && curr > trimEnd) {
      videoRef.current.currentTime = trimStart;
      setCurrentTime(trimStart);
    } else if (curr < trimStart) {
      videoRef.current.currentTime = trimStart;
      setCurrentTime(trimStart);
    } else {
      setCurrentTime(curr);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    setDuration(dur);
    if (trimEnd === 0) {
      onTrimChange(0, dur);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent play/pause trigger when seeking
    if (!videoRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = percentage * duration;
    setCurrentTime(percentage * duration);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="video/*"
        onChange={handleChange}
        id="video-upload-input"
      />
      {/* Hidden helper video elements for real-time background frame seeking */}
      {videoSrc && (
        <>
          <video ref={startVideoRef} src={videoSrc} className="hidden" muted playsInline />
          <video ref={endVideoRef} src={videoSrc} className="hidden" muted playsInline />
        </>
      )}

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${isDragActive
            ? "border-amber-500 bg-amber-950/10 shadow-[0_0_20px_rgba(212,160,64,0.15)]"
            : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-950/60"
            }`}
          id="upload-dropzone"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <div className="p-4 mb-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-amber-500 transition-colors">
              <Upload className="w-8 h-8" />
            </div>
            <p className="mb-2 text-base text-zinc-200">
              <span className="font-semibold text-amber-500">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-zinc-500">
              MP4, WebM or OGG (Short video clips are recommended)
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col p-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-md">
          <button
            onClick={onVideoCleared}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-full border border-zinc-800 transition-all z-10"
            title="Remove video"
            id="btn-remove-video"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl">
              <Video className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-100 truncate">
                {selectedFile.name}
              </p>
              <div className="flex gap-4 text-xs text-zinc-400 mt-1">
                <span>Size: {formatFileSize(selectedFile.size)}</span>
                <span className="flex items-center gap-1">
                  <Film className="w-3.5 h-3.5" /> Video Format
                </span>
              </div>
            </div>
          </div>

          {/* Custom Cinematic Video Preview Player */}
          {videoSrc && (
            <div className="relative mt-4 w-full rounded-xl overflow-hidden border border-zinc-900 bg-black/60 shadow-inner group">
              <video
                ref={videoRef}
                src={videoSrc}
                muted={isMuted}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                className="w-full h-auto max-h-48 object-contain block mx-auto cursor-pointer"
              />

              {/* Custom Cinematic Overlay Controls (shows on hover) */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2 z-20">

                {/* Custom Progress Bar / Seek Slider */}
                <div
                  onClick={handleSeek}
                  className="relative w-full h-1 bg-zinc-800 rounded-full cursor-pointer hover:h-1.5 transition-all"
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-primary rounded-full"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>

                {/* Buttons Row */}
                <div className="flex items-center justify-between text-zinc-350">
                  <div className="flex items-center gap-3">

                    {/* Play/Pause Button */}
                    <button
                      onClick={togglePlay}
                      className="hover:text-primary transition-colors cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="w-4.5 h-4.5 fill-current" />
                      ) : (
                        <Play className="w-4.5 h-4.5 fill-current" />
                      )}
                    </button>

                    {/* Mute/Unmute Button */}
                    <button
                      onClick={toggleMute}
                      className="hover:text-primary transition-colors cursor-pointer"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4.5 h-4.5" />
                      ) : (
                        <Volume2 className="w-4.5 h-4.5" />
                      )}
                    </button>

                    {/* Timeline Text */}
                    <span className="text-[10px] font-mono text-zinc-400">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Right side: Film strip indicator */}
                  <div className="flex items-center gap-1 opacity-60">
                    <Film className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-wider font-sans">Active Preview</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Video Trimmer / Clipper Controls */}
          {duration > 0 && (
            <div className="mt-4 p-4 rounded-xl border border-zinc-900/60 bg-zinc-950/40 flex flex-col gap-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                  <Scissors className="w-3.5 h-3.5 text-primary" />
                  Video Trimmer / Clipper
                </span>
                <span className="text-[10px] font-mono text-zinc-400 font-bold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                  Range: {formatTime(trimStart)} - {formatTime(trimEnd)}
                </span>
              </div>

              {/* Live Boundary Frame Previews */}
              <div className="grid grid-cols-2 gap-4 mb-2.5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-extrabold text-zinc-550 uppercase tracking-wider font-sans">
                    Start Frame Preview ({formatTime(trimStart)})
                  </span>
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-zinc-900 bg-zinc-950/80 flex items-center justify-center relative shadow-sm">
                    {startFrameImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={startFrameImg} alt="Start Boundary Frame" className="w-full h-full object-contain select-none animate-in fade-in duration-200" />
                    ) : (
                      <div className="text-[10px] text-zinc-600 font-mono flex items-center gap-1.5">
                        <div className="w-3 h-3 border border-zinc-700 border-t-transparent rounded-full animate-spin"></div>
                        Decoding...
                      </div>
                    )}
                    <div className="absolute bottom-1.5 left-2 bg-[#0c0c0e]/85 border border-zinc-800 text-[8px] font-mono px-1.5 py-0.5 rounded text-primary shadow-md">
                      Start
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-extrabold text-zinc-550 uppercase tracking-wider font-sans">
                    End Frame Preview ({formatTime(trimEnd)})
                  </span>
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-zinc-900 bg-zinc-950/80 flex items-center justify-center relative shadow-sm">
                    {endFrameImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={endFrameImg} alt="End Boundary Frame" className="w-full h-full object-contain select-none animate-in fade-in duration-200" />
                    ) : (
                      <div className="text-[10px] text-zinc-600 font-mono flex items-center gap-1.5">
                        <div className="w-3 h-3 border border-zinc-700 border-t-transparent rounded-full animate-spin"></div>
                        Decoding...
                      </div>
                    )}
                    <div className="absolute bottom-1.5 left-2 bg-[#0c0c0e]/85 border border-zinc-800 text-[8px] font-mono px-1.5 py-0.5 rounded text-primary shadow-md">
                      End
                    </div>
                  </div>
                </div>
              </div>

              {/* Trimmer Sliders */}
              <div className="flex flex-col gap-3 mt-1">
                {/* Start Slider */}
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-extrabold text-zinc-500 w-8 font-sans">START</span>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val < trimEnd - 0.5) {
                        onTrimChange(val, trimEnd);
                      }
                    }}
                    className="flex-1 accent-primary h-1 bg-zinc-700 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-zinc-400 w-10 text-right">{formatTime(trimStart)}</span>
                </div>

                {/* End Slider */}
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-extrabold text-zinc-500 w-8 font-sans">END</span>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val > trimStart + 0.5) {
                        onTrimChange(trimStart, val);
                      }
                    }}
                    className="flex-1 accent-primary h-1 bg-zinc-700 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-zinc-400 w-10 text-right">{formatTime(trimEnd)}</span>
                </div>
              </div>

              {/* Trimmer Actions */}
              <div className="mt-4 pt-3 border-t border-zinc-900/60">
                <button
                  onClick={onApplyTrim}
                  disabled={isProcessing}
                  className="w-full py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground shadow-md active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer font-sans text-center"
                  id="btn-apply-trim-extract"
                >
                  {isProcessing ? "Extracting..." : "Update Storyboard"}
                </button>
              </div>

            </div>
          )}

          {isProcessing && (
            <div className="mt-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-center gap-3 text-sm text-zinc-400">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Extracting video frames in the browser...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
