import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SubpageHeader from "@/components/SubpageHeader";
import { ShieldCheck, ShieldAlert, Key, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | NovaCaption AI",
  description: "Read our privacy guidelines. NovaCaption AI is designed with privacy first, processing all video files locally in your browser canvas.",
};

export default function PrivacyPage() {
  return (
    <div className="flex-1 w-full min-h-screen bg-background text-foreground flex flex-col items-center transition-colors duration-300">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-[#cc7b5c]/5 to-transparent blur-[100px] pointer-events-none rounded-full" />

      {/* Main Container */}
      <div className="w-full max-w-7xl px-6 md:px-8 py-6 flex-1 flex flex-col z-10">
        <SubpageHeader
          title="Privacy Policy"
          subtitle="Last updated: July 2026. How we secure your video media and API keys."
        />

        <main className="flex flex-col gap-6 mb-12">
          {/* Top Panel: Summary */}
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/20 backdrop-blur-xl flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-widest pl-0.5 font-sans mb-1">
                Privacy-First Architecture
              </h2>
              <p className="text-zinc-300 text-xs leading-relaxed font-sans font-medium">
                At NovaCaption AI, privacy is built directly into our code. Your video files are processed entirely on your local machine.
                We do not upload your video files to any server. Only compressed keyframes are transmitted for VLM analysis.
              </p>
            </div>
          </div>

          {/* Details sections */}
          <div className="flex flex-col gap-6 text-zinc-300 text-xs leading-relaxed font-sans font-medium">
            {/* Section 1 */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-zinc-200 font-sans flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                1. Local Video Processing & Frame Extraction
              </h3>
              <p>
                When you load a video file into NovaCaption:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-1.5 mt-1">
                <li>The browser reads the video data using HTML5 canvas and hardware decoder APIs locally.</li>
                <li>The frame extraction and decoding timeline run entirely on your browser client.</li>
                <li>Your raw media files are never transferred, cached, or stored on our backend web servers.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-zinc-200 font-sans flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                2. Data Sent to Fireworks AI APIs
              </h3>
              <p>
                To generate the stylized descriptions, captions, and tags:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-1.5 mt-1">
                <li><strong>Compressed Keyframes:</strong> We compress the extracted keyframes (480px JPEG) to reduce network payload and protect your content. Only these compressed frames are sent to the Vision-Language Model.</li>
                <li><strong>Audio Tracks:</strong> If audio is present, a 16kHz resampled mono WAV segment is extracted to perform local or serverless Whisper transcription.</li>
                <li><strong>API Usage:</strong> The payload is dispatched to Fireworks AI inference clusters via encrypted HTTPS channels. No training is performed on your inputs.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-zinc-200 font-sans flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                3. Key Storage & Preferences
              </h3>
              <p>
                Your settings (such as chosen model targets, frame extraction density, brand custom tones, and light/dark theme preference) are saved inside your browser’s `localStorage`. They are never sent to our servers and can be wiped instantly by clearing your browser cache.
              </p>
            </div>

            {/* Section 4 */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-zinc-200 font-sans flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                4. Data Protection & Security
              </h3>
              <p>
                We use industry-standard Secure Socket Layer (SSL/TLS) encryption for all backend-to-AI data exchanges. If you have questions regarding data compliance, security policies, or enterprise keys, contact our privacy group at <Link href="/contact" className="text-primary hover:underline">contact support</Link>.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-6 text-center text-[10px] text-zinc-500 border-t border-zinc-900 mt-auto flex flex-col gap-2.5 items-center">
          <div className="flex gap-4 flex-wrap justify-center text-zinc-500 font-sans font-medium text-[11px]">
            <Link href="/" className="hover:text-primary transition-colors">Editor</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            <span>•</span>
            <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
          </div>
          <p className="font-sans text-zinc-500">© 2026 NovaCaption AI. Built with Next.js, Tailwind v4 & Fireworks AI.</p>
        </footer>
      </div>
    </div>
  );
}
