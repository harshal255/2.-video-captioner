import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SubpageHeader from "@/components/SubpageHeader";
import { HelpCircle, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | NovaCaption AI",
  description: "Browse frequently asked questions about NovaCaption AI video frame extraction, Whisper audio transcription, and VLM configurations.",
};

export default function FaqPage() {
  const faqs = [
    {
      q: "What is NovaCaption AI and how does it work?",
      a: "NovaCaption AI is a multi-modal content generation tool designed for short-form video creators. It extracts keyframes and audio tracks from uploaded videos in your browser, then sends them to a Vision-Language Model (VLM) via Fireworks AI to compile caption drafts, viral hooks, voiceover scripts, and keywords."
    },
    {
      q: "Are my video files uploaded to your servers?",
      a: "No. Your raw video files never leave your computer. We perform the heavy frame decoding and extraction locally in the browser using the canvas API. Only compressed keyframe images (480px JPEG format) are securely sent to the VLM API endpoint to conserve bandwidth and protect privacy."
    },
    {
      q: "What Vision-Language Models (VLMs) are supported?",
      a: "NovaCaption supports Fireworks AI VLMs including Kimi-VL ( kimi-k2p6 ) and LLaVA. These models are optimized for multi-modal structured outputs, allowing them to accurately correlate visual changes across video timelines."
    },
    {
      q: "How does the Audio Transcription feature work?",
      a: "If your video contains a spoken audio track, NovaCaption resamples the audio to 16kHz mono locally in the browser, creates a WAV PCM blob, and dispatches it to a Whisper API endpoint on Fireworks AI. The generated transcript is then fused with the keyframes to provide rich context to the VLM."
    },
    {
      q: "Can I trim my videos before extracting frames?",
      a: "Yes. Use the built-in Video Trimmer / Clipper sliders to isolate a specific timeline window (e.g. the first 10 seconds or middle hook). Clicking 'Update Storyboard' re-extracts the frames from that trimmed range."
    },
    {
      q: "Why is the frame density selector important?",
      a: "The density selector (4, 6, 8, or 10 frames) determines how many keyframes are extracted and sent to the VLM. More frames capture fast action sequences and fine details, but consume more Fireworks API tokens and take slightly longer to process."
    }
  ];

  // Dynamic Google FAQ Schema JSON-LD structure
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-background text-foreground flex flex-col items-center transition-colors duration-300">
      {/* Dynamic SEO JSON-LD FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-[#cc7b5c]/5 to-transparent blur-[100px] pointer-events-none rounded-full" />

      {/* Main Container */}
      <div className="w-full max-w-7xl px-6 md:px-8 py-6 flex-1 flex flex-col z-10">
        <SubpageHeader
          title="Frequently Asked Questions"
          subtitle="Learn about browser frame decoding, VLM tokens, and privacy parameters"
        />

        <main className="flex flex-col gap-6 mb-12">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group p-4 rounded-xl border border-zinc-800 bg-zinc-950/20 backdrop-blur-xl hover:border-zinc-700 transition-all select-none cursor-pointer"
            >
              <summary className="flex items-center justify-between text-zinc-200 text-xs md:text-sm font-bold uppercase tracking-wider font-sans list-none outline-none">
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                  {faq.q}
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-550 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-3.5 pl-6.5 text-zinc-300 text-xs leading-relaxed font-sans font-medium border-t border-zinc-900/60 pt-3 select-text cursor-text">
                {faq.a}
              </p>
            </details>
          ))}
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
