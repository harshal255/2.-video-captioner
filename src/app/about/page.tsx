import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SubpageHeader from "@/components/SubpageHeader";
import { Cpu, Eye, Film, Sparkles, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | NovaCaption AI",
  description: "Learn how NovaCaption AI uses Fireworks AI VLMs and browser-side video frame decoding to generate high-performing video captions and scripts.",
};

export default function AboutPage() {
  return (
    <div className="flex-1 w-full min-h-screen bg-background text-foreground flex flex-col items-center transition-colors duration-300">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-[#cc7b5c]/5 to-transparent blur-[100px] pointer-events-none rounded-full" />

      {/* Main Container */}
      <div className="w-full max-w-7xl px-6 md:px-8 py-6 flex-1 flex flex-col z-10">
        <SubpageHeader
          title="About NovaCaption AI"
          subtitle="Revolutionizing short-form video content pipelines with Vision-Language Models"
        />

        <main className="flex flex-col gap-6 mb-12">
          {/* Section 1: Intro */}
          <div className="p-6 md:p-8 rounded-2xl border border-zinc-800 bg-zinc-950/20 backdrop-blur-xl flex flex-col gap-4">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 font-sans">
              <Sparkles className="w-5 h-5 text-primary" />
              The Next Generation of Captioning
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed font-sans font-medium">
              NovaCaption AI is a high-performance content engine built for creators, editors, and marketing pipelines.
              Instead of relying on basic audio transcription, NovaCaption fuses **audio context** with **visual frame semantics**
              to capture the true essence of your video clips. 
            </p>
            <p className="text-zinc-300 text-sm leading-relaxed font-sans font-medium">
              By utilizing advanced Vision-Language Models (VLMs) hosted on **Fireworks AI**, NovaCaption reads your video frame-by-frame,
              summarizes cinematic details, translates speech, and generates conversion-optimized viral hooks, narration scripts, and search terms.
            </p>
          </div>

          {/* Section 2: How it works */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1 font-sans">
              How NovaCaption Works
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/10 flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Film className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-sans">1. Client-Side Extraction</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Your video never leaves your machine. NovaCaption decodes and extracts keyframes in full HD directly inside your browser canvas, ensuring complete privacy.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/10 flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-sans">2. VLM Multi-Modal Processing</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Extracted keyframes are paired with audio transcripts and securely dispatched to high-speed LLaVA or Qwen2-VL inference servers on Fireworks AI.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/10 flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-sans">3. Content Synthesis</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  The engine returns complete, formatted marketing copy—including distinct brand voice tones, structured teleprompter scripts, and SEO tags.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Architecture & Security */}
          <div className="p-6 md:p-8 rounded-2xl border border-zinc-800 bg-zinc-950/20 backdrop-blur-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2 font-sans">
              <Eye className="w-4.5 h-4.5 text-primary" />
              Privacy & Performance First
            </h3>
            <div className="flex flex-col gap-3 text-zinc-300 text-xs leading-relaxed font-sans font-medium">
              <p>
                <strong>Zero Video Uploads:</strong> Large video files consume gigabytes of bandwidth. NovaCaption processes files locally, slicing frames in milliseconds. We only transmit lightweight compressed JPEG frames to the AI API, saving you time and bandwidth.
              </p>
              <p>
                <strong>Next.js App Router:</strong> Leverages dynamic, fast routing and layout caching to guarantee instant page loads.
              </p>
              <p>
                <strong>Fireworks VLM Engine:</strong> Generates highly compliant, structured JSON outputs under 3.5 seconds.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-6 text-center text-[10px] text-zinc-500 border-t border-zinc-900 mt-auto flex flex-col gap-2.5 items-center">
          <div className="flex gap-4 flex-wrap justify-center text-zinc-500 font-sans font-medium text-[11px]">
            <Link href="/" className="hover:text-primary transition-colors">Editor</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            <span>•</span>
            <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span className="opacity-0 absolute pointer-events-none w-px h-px overflow-hidden select-none">
              <span>•</span>
              <Link href="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
            </span>
          </div>
          <p className="font-sans text-zinc-500">© 2026 NovaCaption AI. Built with Next.js, Tailwind v4 & Fireworks AI.</p>
        </footer>
      </div>
    </div>
  );
}
