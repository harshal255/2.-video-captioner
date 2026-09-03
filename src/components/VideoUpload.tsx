import React, { useState, useEffect, useRef } from 'react';
import { Upload, Video, X, Film, Play, Pause, Volume2, VolumeX, Scissors } from 'lucide-react';

interface VideoUploadProps {
  onVideoSelected: (file: File) => void;
  onVideoCleared: () => void;
  selectedFile: File | null;
  trimStart: number;
  trimEnd: number;
  onTrimChange: (start: number, end: number) => void;
}

export default function VideoUpload({
  onVideoSelected,
  onVideoCleared,
  selectedFile,
  trimStart,
  trimEnd,
  onTrimChange
}: VideoUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  // Video player controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Boundary frame preview images
  const [startFrameImg, setStartFrameImg] = useState<string | null>(null);
  const [endFrameImg, setEndFrameImg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startVideoRef = useRef<HTMLVideoElement>(null);
  const endVideoRef = useRef<HTMLVideoElement>(null);

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

  useEffect(() => {
    const video = startVideoRef.current;
    if (!video || !videoSrc) return;

    const capture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 160;
      canvas.height = video.videoHeight || 90;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setStartFrameImg(canvas.toDataURL("image/jpeg", 0.85));
      }
    };

    const handleSeeked = () => capture();
    video.addEventListener("seeked", handleSeeked);
    video.currentTime = trimStart;

    if (video.readyState >= 2) capture();

    return () => {
      video.removeEventListener("seeked", handleSeeked);
    };
  }, [trimStart, videoSrc]);

  useEffect(() => {
    const video = endVideoRef.current;
    if (!video || !videoSrc) return;

    const capture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 160;
      canvas.height = video.videoHeight || 90;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setEndFrameImg(canvas.toDataURL("image/jpeg", 0.85));
      }
    };

    const handleSeeked = () => capture();
    video.addEventListener("seeked", handleSeeked);
    video.currentTime = trimEnd;

    if (video.readyState >= 2) capture();

    return () => {
      video.removeEventListener("seeked", handleSeeked);
    };
  }, [trimEnd, videoSrc]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) onVideoSelected(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onVideoSelected(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
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

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="video/*"
        onChange={handleChange}
      />

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
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 shadow-xl ${
            isDragActive
              ? 'border-amber-500 bg-amber-500/10'
              : 'bg-white dark:bg-zinc-950/40 border-slate-300 dark:border-zinc-800 hover:border-amber-500/60'
          }`}
        >
          <div className="flex flex-col items-center justify-center text-center px-4">
            <div className="p-4 mb-3 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-amber-500 transition-colors shadow-sm">
              <Upload className="w-7 h-7" />
            </div>
            <p className="mb-1 text-sm font-bold text-slate-900 dark:text-zinc-100">
              <span className="text-amber-500">Click to upload video</span> or drag & drop
            </p>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
              Supports MP4, WebM, MOV, AVI, MKV (100% Private, Client-Side)
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col p-5 w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 backdrop-blur-xl shadow-xl transition-colors">
          <button
            type="button"
            onClick={onVideoCleared}
            className="absolute top-4 right-4 p-1.5 text-slate-500 dark:text-zinc-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full border border-slate-300 dark:border-zinc-700 transition-all z-10"
            title="Remove video"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
              <Video className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                {selectedFile.name}
              </p>
              <div className="flex gap-4 text-[11px] text-slate-600 dark:text-zinc-400 font-semibold mt-0.5">
                <span>Size: {formatFileSize(selectedFile.size)}</span>
                <span className="flex items-center gap-1 font-mono">
                  <Film className="w-3 h-3 text-amber-500" /> {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>

          {/* Cinematic Video Player */}
          {videoSrc && (
            <div className="relative mt-4 w-full rounded-xl overflow-hidden border border-slate-300 dark:border-zinc-800 bg-black shadow-inner group">
              <video
                ref={videoRef}
                src={videoSrc}
                muted={isMuted}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                className="w-full h-auto max-h-52 object-contain block mx-auto cursor-pointer"
              />

              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2 z-20">
                <div className="flex items-center justify-between text-zinc-300">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="hover:text-amber-500 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.muted = !isMuted;
                          setIsMuted(!isMuted);
                        }
                      }}
                      className="hover:text-amber-500 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <span className="text-[10px] font-mono text-zinc-300">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trimmer Sliders */}
          {duration > 0 && (
            <div className="mt-4 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/80 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Scissors className="w-3.5 h-3.5 text-amber-500" />
                  Video Trim Range
                </span>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                  {formatTime(trimStart)} — {formatTime(trimEnd)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-slate-600 dark:text-zinc-400 font-bold">START ({formatTime(trimStart)})</span>
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-300 dark:border-zinc-800 bg-black flex items-center justify-center">
                    {startFrameImg ? (
                      <img src={startFrameImg} alt="Start frame" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-400">Loading...</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-slate-600 dark:text-zinc-400 font-bold">END ({formatTime(trimEnd)})</span>
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-300 dark:border-zinc-800 bg-black flex items-center justify-center">
                    {endFrameImg ? (
                      <img src={endFrameImg} alt="End frame" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-400">Loading...</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-slate-600 dark:text-zinc-400 font-bold w-10">START</span>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (v < trimEnd - 0.2) onTrimChange(v, trimEnd);
                    }}
                    className="flex-1 accent-amber-500 h-1 bg-slate-300 dark:bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-slate-600 dark:text-zinc-400 font-bold w-10">END</span>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (v > trimStart + 0.2) onTrimChange(trimStart, v);
                    }}
                    className="flex-1 accent-amber-500 h-1 bg-slate-300 dark:bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
