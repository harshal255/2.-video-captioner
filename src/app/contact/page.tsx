import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SubpageHeader from "@/components/SubpageHeader";
import { Mail, HelpCircle, FileText, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | NovaCaption AI",
  description: "Get in touch with the NovaCaption support team for integration questions, business partnerships, or developer inquiries.",
};

export default function ContactPage() {
  return (
    <div className="flex-1 w-full min-h-screen bg-background text-foreground flex flex-col items-center transition-colors duration-300">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-[#cc7b5c]/5 to-transparent blur-[100px] pointer-events-none rounded-full" />

      {/* Main Container */}
      <div className="w-full max-w-7xl px-6 md:px-8 py-6 flex-1 flex flex-col z-10">
        <SubpageHeader
          title="Contact Support"
          subtitle="Reach out for help with APIs, custom models, and enterprise video pipelines"
        />

        <main className="flex flex-col gap-6 mb-12">
          {/* Centered Support channels card */}
          <div className="p-6 md:p-8 rounded-2xl border border-zinc-800 bg-zinc-950/20 backdrop-blur-xl flex flex-col gap-6">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-0.5 font-sans">
              Support Channels
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-sans">Direct Email</h4>
                  <p className="text-zinc-400 text-[10px] mt-0.5 select-all">harshalskahar389@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-sans">FAQ & Help</h4>
                  <Link href="/faq" className="text-[10px] text-primary hover:underline mt-0.5 inline-block">
                    Browse documentation & FAQs
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-sans">Terms & Privacy</h4>
                  <Link href="/privacy" className="text-[10px] text-primary hover:underline mt-0.5 inline-block">
                    Read Privacy Policy rules
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-sans">API Status</h4>
                  <p className="text-[10px] text-emerald-500 font-bold mt-0.5">All Systems Operational</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/10 text-[11px] text-zinc-400 leading-relaxed pl-4 font-sans text-center">
            For dedicated VLM endpoint limits, custom writing voices, or business inquiries, please reach out directly via email.
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-6 text-center text-[10px] text-zinc-500 border-t border-zinc-900 mt-auto flex flex-col gap-2.5 items-center">
          <div className="flex gap-4 flex-wrap justify-center text-zinc-500 font-sans font-medium text-[11px]">
            <Link href="/" className="hover:text-primary transition-colors">Editor</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
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
