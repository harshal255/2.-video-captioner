"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, AlertTriangle, Info, Sliders } from "lucide-react";
import { toast } from "react-hot-toast";
import VideoUpload from "@/components/VideoUpload";
import FrameStrip from "@/components/FrameStrip";
import CaptionGrid from "@/components/CaptionGrid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { extractAudio } from "@/utils/audio";
import { extractFrames, compressFrameForApi } from "@/utils/video";

interface Captions {
  formal: string;
  sarcastic: string;
  humorousTech: string;
  humorousNonTech: string;
  viralHooks?: string[];
  voiceoverScript?: string;
  seoKeywords?: string[];
  seoHashtags?: string[];
  seoDescription?: string;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [frames, setFrames] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  // Audio Transcription states
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioTranscript, setAudioTranscript] = useState<string | null>(null);
  const [isExtractingAudio, setIsExtractingAudio] = useState(false);
  const [numFrames, setNumFrames] = useState(4);
  const [selectedModel, setSelectedModel] = useState("accounts/fireworks/models/kimi-k2p6");
  const [customTone, setCustomTone] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [captions, setCaptions] = useState<Captions | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Video Trimmer states
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("novacaption-theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      localStorage.setItem("novacaption-theme", "dark");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      localStorage.setItem("novacaption-theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };



  // Load metadata and extract initial full-length keyframes on file change
  useEffect(() => {
    if (!selectedFile) {
      setFrames([]);
      setTrimStart(0);
      setTrimEnd(0);
      setVideoDuration(0);
      return;
    }

    const runInitialExtraction = async () => {
      setIsExtracting(true);
      setError(null);
      setFrames([]);
      setCaptions(null);
      setRawText(null);

      try {
        const tempVideo = document.createElement("video");
        const tempUrl = URL.createObjectURL(selectedFile);
        tempVideo.src = tempUrl;

        let duration = 0;
        await new Promise<void>((resolve) => {
          tempVideo.onloadedmetadata = () => {
            duration = tempVideo.duration;
            setVideoDuration(duration);
            setTrimStart(0);
            setTrimEnd(duration);
            resolve();
          };
        });
        URL.revokeObjectURL(tempUrl);

        // Extract initial frames across full duration
        const extracted = await extractFrames(selectedFile, numFrames, 0, duration);
        setFrames(extracted);
        toast.success("Video uploaded and keyframes extracted!");
      } catch (err: any) {
        console.error("Initial extraction error:", err);
        const errMsg = "Failed to extract frames from the selected video.";
        setError(errMsg);
        toast.error(errMsg);
      } finally {
        setIsExtracting(false);
      }
    };

    runInitialExtraction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  // Manually trigger extraction when user applies new trim boundaries or count settings
  const triggerExtraction = async (overrideCount?: number) => {
    if (!selectedFile) return;
    setIsExtracting(true);
    setError(null);
    setFrames([]);
    setCaptions(null);
    setRawText(null);
    const toastId = toast.loading("Re-extracting keyframes from trimmed range...");

    try {
      const start = trimStart;
      const end = trimEnd === 0 ? videoDuration : trimEnd;
      const count = typeof overrideCount === "number" ? overrideCount : numFrames;

      const extracted = await extractFrames(selectedFile, count, start, end);
      setFrames(extracted);
      toast.success("Keyframes updated successfully!", { id: toastId });
    } catch (err: any) {
      console.error("Manual extraction error:", err);
      const errMsg = "Failed to update keyframes from trimmed range.";
      setError(errMsg);
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleVideoSelected = (file: File) => {
    setSelectedFile(file);
    // Reset trimmer for the new file
    setTrimStart(0);
    setTrimEnd(0);
    setVideoDuration(0);
    setAudioBlob(null);
    setAudioTranscript(null);

    // Extract audio track in the background
    setIsExtractingAudio(true);
    const runAudioExtraction = async () => {
      try {
        const wavBlob = await extractAudio(file);
        setAudioBlob(wavBlob);
      } catch (e) {
        console.warn("Failed to extract audio track:", e);
      } finally {
        setIsExtractingAudio(false);
      }
    };
    runAudioExtraction();
  };

  const handleVideoCleared = () => {
    setSelectedFile(null);
    setFrames([]);
    setCaptions(null);
    setRawText(null);
    setError(null);
    setTrimStart(0);
    setTrimEnd(0);
    setVideoDuration(0);
    setAudioBlob(null);
    setAudioTranscript(null);
    setIsExtractingAudio(false);
    setCustomTone("");
  };

  const handleTrimChange = (start: number, end: number) => {
    setTrimStart(start);
    setTrimEnd(end);
  };



  const generateCaptions = async () => {
    if (frames.length === 0) {
      const errMsg = "Please wait for video frame extraction to finish before generating captions.";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCaptions(null);
    setRawText(null);
    const toastId = toast.loading("Analyzing frames and generating captions...");

    try {
      // 1. Transcribe audio if we have an audio track and haven't transcribed it yet
      let transcriptText = audioTranscript;
      if (audioBlob && !transcriptText) {
        toast.loading("Transcribing video audio using Whisper...", { id: toastId });
        try {
          const audioFormData = new FormData();
          audioFormData.append("file", new File([audioBlob], "audio.wav", { type: "audio/wav" }));

          const transcribeRes = await fetch("/api/transcribe", {
            method: "POST",
            body: audioFormData
          });

          if (transcribeRes.ok) {
            const transcribeData = await transcribeRes.json();
            transcriptText = transcribeData.text;
            setAudioTranscript(transcriptText);
          } else {
            console.warn("Audio transcription failed, proceeding with visuals only.");
          }
        } catch (transcribeErr) {
          console.warn("Error transcribing audio:", transcribeErr);
        }
      }

      // 2. Compress frames on-the-fly to 480px at 0.4 quality for transit payload efficiency
      toast.loading("Analyzing frames and generating captions...", { id: toastId });
      const compressedFrames = await Promise.all(frames.map(compressFrameForApi));

      const response = await fetch("/api/caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          frames: compressedFrames,
          model: selectedModel,
          transcript: transcriptText,
          customTone: customTone
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate video captions.");
      }

      if (data.captions) {
        setCaptions(data.captions);
        toast.success("Captions generated successfully!", { id: toastId });
      } else if (data.rawText) {
        setRawText(data.rawText);
        if (data.error) {
          setError(data.error); // Show warning if format parsing was slightly off
          toast.error(data.error, { id: toastId });
        } else {
          toast.success("Captions generated successfully!", { id: toastId });
        }
      }
    } catch (err: any) {
      console.error("Caption generation error:", err);
      const errMsg = err?.message || "An error occurred while connecting to the Fireworks API server.";
      setError(errMsg);
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-background text-foreground flex flex-col items-center transition-colors duration-300">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-[#cc7b5c]/5 to-transparent blur-[100px] pointer-events-none rounded-full" />

      {/* Main Container */}
      <div className="w-full max-w-7xl px-6 md:px-8 py-6 flex-1 flex flex-col z-10">

        {/* Header Branding */}
        <Header theme={theme} toggleTheme={toggleTheme} />

        {/* Layout Flow: Stacked Rows (Row 1: Upload & Storyboard side-by-side; Row 2: Settings & Captions below) */}
        <main className="flex flex-col gap-6 flex-1">

          {/* Row 1: Upload & Storyboard side-by-side */}
          <div className={selectedFile ? "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start" : "w-full"}>

            {/* Left Card: Upload Media */}
            <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-xl min-w-0">
              <h2 className="text-xs font-bold text-zinc-200 mb-4 uppercase tracking-wider flex items-center gap-2">
                <span>1. Upload Media</span>
              </h2>
              <VideoUpload
                onVideoSelected={handleVideoSelected}
                onVideoCleared={handleVideoCleared}
                selectedFile={selectedFile}
                isProcessing={isExtracting}
                trimStart={trimStart}
                trimEnd={trimEnd}
                onTrimChange={handleTrimChange}
                onApplyTrim={triggerExtraction}
              />
            </div>

            {/* Right Card: Storyboard Carousel (always stays side-by-side when video is selected to prevent layout shifting) */}
            {selectedFile && (
              <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-xl min-w-0 min-h-[280px]">
                {isExtracting || frames.length === 0 ? (
                  <div className="flex flex-col gap-4 w-full h-full animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                          Storyboard Carousel
                        </span>
                        <p className="text-[9px] text-zinc-500 font-medium font-sans mt-0.5">Extracting keyframes...</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 my-1">
                      {/* Active Frame Preview Skeleton */}
                      <div className="w-full aspect-video rounded-xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-900 animate-pulse flex items-center justify-center relative shadow-inner">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                          <span className="text-[10px] text-zinc-500 font-sans tracking-wide">Capturing HD frame textures...</span>
                        </div>
                        <div className="absolute bottom-2.5 left-3 bg-[#0c0c0e]/85 border border-zinc-800 text-[8px] font-mono px-1.5 py-0.5 rounded text-primary">
                          Frame 01
                        </div>
                      </div>

                      {/* Carousel Row Skeleton */}
                      <div className="relative w-full flex items-center bg-zinc-950/30 border border-zinc-900/80 rounded-xl p-2.5 gap-3 overflow-hidden">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className={`flex-shrink-0 w-24 aspect-video rounded-lg bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-900 animate-pulse relative ${i === 0 ? "border-primary/40 animate-pulse" : "opacity-30"
                              }`}
                          >
                            <div className="absolute bottom-1 left-1.5 bg-[#0c0c0e]/85 border border-zinc-800/80 text-[6px] font-mono px-1.5 py-0.5 rounded text-zinc-650">
                              #{i + 1}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Export Button Skeleton */}
                      <div className="flex justify-end mt-1 animate-pulse">
                        <div className="h-6.5 w-32 rounded-lg bg-zinc-900/50 border border-zinc-850"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <FrameStrip frames={frames} />
                )}
              </div>
            )}

          </div>

          {/* Row 2: Parameters, Action, Error Banner & Captions Output stacked vertically below Row 1 */}
          <div className="flex flex-col gap-6 w-full">
            <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-xl flex flex-col gap-4">
              <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                2. Parameters & Settings
              </h2>

              {/* Custom Tone of Voice & Prompt Tuning */}
              <div className="flex flex-col gap-1.5 mt-1" id="custom-tone-container">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Sliders className="w-3.5 h-3.5 text-primary" />
                  Custom Brand Voice / Writing Style
                </span>
                <input
                  type="text"
                  value={customTone}
                  onChange={(e) => setCustomTone(e.target.value)}
                  placeholder="e.g. Write like Alex Hormozi, keep it punchy, use emojis, explain simply..."
                  className="w-full h-10 bg-zinc-950/80 hover:bg-zinc-955 border border-zinc-800 hover:border-zinc-700 rounded-lg px-3.5 text-xs text-zinc-205 placeholder-zinc-600 focus:border-primary focus:outline-none transition-colors font-medium shadow-inner"
                  id="input-custom-tone"
                />
              </div>

              {/* Segmented Control for Frame Count Selection */}
              <div className="flex flex-col gap-1.5 mt-1" id="frame-count-selector-container">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  Keyframe Extraction Density
                </span>
                <div className="grid grid-cols-4 gap-1.5 bg-zinc-950/80 p-1 border border-zinc-800/80 rounded-lg">
                  {[4, 6, 8, 10].map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        setNumFrames(count);
                        if (selectedFile) {
                          triggerExtraction(count);
                        }
                      }}
                      className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${numFrames === count
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                        }`}
                      id={`btn-frame-count-${count}`}
                    >
                      {count} Frames
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-zinc-500 pl-0.5">
                  Adjust frames based on video length. More frames capture details but use more API tokens.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={generateCaptions}
                disabled={!mounted || isGenerating || frames.length === 0 || isExtracting}
                suppressHydrationWarning
                className="w-fit self-start mt-1 py-2.5 px-6 rounded-lg font-bold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none disabled:hover:scale-100 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-sm text-sm flex items-center justify-center gap-2"
                id="btn-generate-captions"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    <span>Processing in Fireworks AI...</span>
                  </>
                ) : (
                  <span>Generate Captions</span>
                )}
              </button>
            </div>

            {/* Global Error Banner */}
            {error && (
              <div className="w-full p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-200 flex gap-3 text-xs animate-in fade-in" id="error-banner">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                <div>
                  <p className="font-semibold">Action Failed</p>
                  <p className="text-[11px] text-rose-300/80 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Audio Transcript Panel */}
            {audioTranscript && (
              <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-xl flex flex-col gap-2.5 animate-in fade-in" id="audio-transcript-panel">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-900/60">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                    Spoken Audio Transcript (Whisper)
                  </span>
                </div>
                <p className="text-xs md:text-sm text-zinc-300 italic leading-relaxed font-sans pl-1 bg-zinc-950/40 p-3 rounded-lg border border-zinc-900">
                  "{audioTranscript}"
                </p>
              </div>
            )}

            {/* Caption Output */}
            <CaptionGrid captions={captions} rawText={rawText} />
          </div>

        </main>

      </div>

      {/* Footer Branding */}
      <Footer />
    </div>
  );
}
