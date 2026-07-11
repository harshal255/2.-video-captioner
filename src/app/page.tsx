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
import { sanitizeJsonString, repairTruncatedJson } from "@/utils/json";

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

    const apiKey = process.env.NEXT_PUBLIC_FIREWORKS_API_KEY || "";

    if (!apiKey) {
      const errMsg = "Fireworks API Key is not configured. Please check your environment variables.";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCaptions(null);
    setRawText(null);
    const toastId = toast.loading("Analyzing frames and transcribing audio...");

    try {
      // 1. Transcribe audio if we have an audio track and haven't transcribed it yet
      let transcriptText = audioTranscript;
      if (audioBlob && !transcriptText) {
        toast.loading("Transcribing video audio using Whisper...", { id: toastId });
        try {
          const audioFormData = new FormData();
          audioFormData.append("file", new File([audioBlob], "audio.wav", { type: "audio/wav" }));
          audioFormData.append("model", "whisper-v3");

          const transcribeRes = await fetch("https://api.fireworks.ai/inference/v1/audio/transcriptions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`
            },
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

      let toneInstruction = "";
      if (customTone && customTone.trim().length > 0) {
        toneInstruction = `\n\nCRITICAL STYLE / TONE OF VOICE DIRECTION:\nThe user has requested a specific brand voice/writing style. You MUST adapt all captions ("formal", "sarcastic", "humorousTech", "humorousNonTech"), hooks, voiceover script, and description to match the following style instructions:\n"${customTone.trim()}"`;
      }

      const contentPayload: any[] = [
        {
          type: "text",
          text: `You are an expert video captioner and creative writer.
You are given a sequence of keyframes extracted chronologically from a short video clip.${transcriptText ? `\n\nWe have also transcribed the spoken audio dialogue from the video:\n"${transcriptText}"\nUse this spoken dialogue context, names, and verbal cues to align your captions with what is being said in the clip.` : ""}
Analyze these frames carefully to understand the events, environment, people, actions, and emotions.

Based on your internal analysis, generate the following content for this video:
1. "formal": A professional, clear, and objective description of what happens in the video.
2. "sarcastic": A witty, sarcastic, or mockingly critical caption about what is happening in the video.
3. "humorousTech": A funny caption tailored for programmers, developers, or tech enthusiasts (use coding terms, tech culture references, bugs, compiling, AI, etc.).
4. "humorousNonTech": A broadly funny, relatable, and humorous caption for everyday viewers.
5. "viralHooks": An array of exactly 3 high-impact, attention-grabbing text overlay hooks for the first 3 seconds of the video, based on visual hooks in the starting frames (e.g. "POV: You find a bug in prod...", "I didn't expect this...").
6. "voiceoverScript": A short, concise 2-sentence storytelling voiceover/narration script that matches the chronological flow of the storyboard keyframes.
7. "seoKeywords": An array of up to 12 highly optimized search keywords (e.g., "react debugging tips", "coding compilation error") based on the visual contents and transcript.
8. "seoHashtags": An array of exactly 5 relevant, lowercase hashtags (e.g., ["#coding", "#dev", "#programmer", "#webdev", "#javascript"]) for backward compatibility.
9. "seoDescription": A brief 2-sentence SEO-optimized description paragraph incorporating the transcript, dialogue, and keywords naturally to boost social platform search indexing.${toneInstruction}

CRITICAL FORMATTING RULES:
- Do NOT output any frame-by-frame descriptions, analysis list, or explanations in your response content. Keep your analysis entirely internal.
- Do NOT include any conversational intro, filler, or outro.
- Your entire response MUST start with '{' and end with '}'.
- Output ONLY the raw JSON object.

Your response MUST be a valid JSON object matching the following structure:
{
  "formal": "Your formal caption here.",
  "sarcastic": "Your sarcastic caption here.",
  "humorousTech": "Your humorous tech-related caption here.",
  "humorousNonTech": "Your humorous non-tech/general caption here.",
  "viralHooks": ["Hook 1", "Hook 2", "Hook 3"],
  "voiceoverScript": "Your concise 2-sentence voiceover script narration.",
  "seoKeywords": ["keyword1", "keyword2", "keyword3"],
  "seoHashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "seoDescription": "Your brief 2-sentence SEO-optimized description paragraph here."
}`
        }
      ];

      compressedFrames.forEach((base64Frame: string) => {
        let imageUrl = base64Frame;
        if (!imageUrl.startsWith("data:image/")) {
          imageUrl = `data:image/jpeg;base64,${base64Frame}`;
        }
        contentPayload.push({
          type: "image_url",
          image_url: {
            url: imageUrl
          }
        });
      });

      const response = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: "system",
              content: "You are a strict JSON generator. Your output must contain ONLY a valid JSON object matching the requested schema. Do not output any thought process, explanations, markdown codes, or conversational text. Your output must start with '{' and end with '}'."
            },
            {
              role: "user",
              content: contentPayload
            }
          ],
          temperature: 0.2,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fireworks API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content;

      if (!assistantMessage) {
        throw new Error("Empty response received from the AI model.");
      }

      console.log("Raw Assistant Response:", assistantMessage);

      let jsonContent = assistantMessage.trim();
      if (jsonContent.startsWith("```json")) {
        jsonContent = jsonContent.slice(7);
      } else if (jsonContent.startsWith("```")) {
        jsonContent = jsonContent.slice(3);
      }
      if (jsonContent.endsWith("```")) {
        jsonContent = jsonContent.slice(0, -3);
      }
      jsonContent = jsonContent.trim();

      const firstBrace = jsonContent.indexOf("{");
      const lastBrace = jsonContent.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
      } else if (firstBrace !== -1) {
        jsonContent = jsonContent.substring(firstBrace);
      }

      let cleanedMessage = repairTruncatedJson(jsonContent);
      cleanedMessage = sanitizeJsonString(cleanedMessage);
      cleanedMessage = cleanedMessage.replace(/,\s*([\]}])/g, "$1");

      try {
        const parsedCaptions = JSON.parse(cleanedMessage);

        if (!parsedCaptions.formal || !parsedCaptions.sarcastic || !parsedCaptions.humorousTech || !parsedCaptions.humorousNonTech) {
          throw new Error("Missing required JSON fields in AI response.");
        }

        if (!parsedCaptions.viralHooks) parsedCaptions.viralHooks = [];
        if (!parsedCaptions.voiceoverScript) parsedCaptions.voiceoverScript = "";
        if (!parsedCaptions.seoKeywords) parsedCaptions.seoKeywords = [];
        if (!parsedCaptions.seoHashtags) parsedCaptions.seoHashtags = [];
        if (!parsedCaptions.seoDescription) parsedCaptions.seoDescription = "";

        setCaptions(parsedCaptions);
        toast.success("Captions generated successfully!", { id: toastId });
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", cleanedMessage, parseError);
        setRawText(assistantMessage);
        setError("Response format was not strictly JSON, showing raw output.");
        toast.error("Response format was not strictly JSON, showing raw output.", { id: toastId });
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
      <div className="w-full max-w-7xl px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex-1 flex flex-col z-10">

        {/* Header Branding */}
        <Header theme={theme} toggleTheme={toggleTheme} />

        {/* Layout Flow: Stacked Rows (Row 1: Upload & Storyboard side-by-side; Row 2: Settings & Captions below) */}
        <main className="flex flex-col gap-4 sm:gap-6 flex-1">

          {/* Row 1: Upload & Storyboard side-by-side */}
          <div className={selectedFile ? "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start" : "w-full"}>

            {/* Left Card: Upload Media */}
            <div className="p-4 sm:p-5 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-xl min-w-0">
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
              <div className="p-4 sm:p-5 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-xl min-w-0 min-h-[280px]">
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
          <div className="flex flex-col gap-4 sm:gap-6 w-full">
            <div className="p-4 sm:p-5 rounded-xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-xl flex flex-col gap-3.5 sm:gap-4">
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
                className="w-full sm:w-fit sm:self-start mt-1 py-2.5 px-6 rounded-lg font-bold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none disabled:hover:scale-100 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-sm text-sm flex items-center justify-center gap-2"
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
