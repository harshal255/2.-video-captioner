"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";

interface HeaderProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export default function Header({ theme, toggleTheme }: HeaderProps) {
  return (
    <>
      {/* Navigation / Header Brand */}
      <header className="w-full flex items-center justify-between border-b border-border pb-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <img src="/icon.svg" alt="NovaCaption Logo" className="w-7 h-7 object-contain" />
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#d97754] via-[#e99f82] to-[#cc7b5c] font-sans whitespace-nowrap">
              NovaCaption AI
            </span>
            <p className="text-[9px] text-zinc-500 font-medium font-sans whitespace-nowrap">Video Captioning Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-primary hover:border-zinc-700 transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            id="theme-toggle-btn"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
            <span className="text-[10px] text-zinc-400 font-medium font-mono">AI Processing Ready</span>
          </div>
        </div>
      </header>

      {/* Page Titles */}
      <div className="text-center md:text-left mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent mb-1.5 font-sans" id="main-heading">
          AI-Powered Video Captioning
        </h1>
        <p className="text-xs md:text-sm text-zinc-400 max-w-xl leading-relaxed font-sans">
          Upload short clips, extract visual frame states in real-time, and generate formal, sarcastic, humorous-tech, and humorous-non-tech captions using high-performance Vision-Language Models.
        </p>
      </div>
    </>
  );
}
