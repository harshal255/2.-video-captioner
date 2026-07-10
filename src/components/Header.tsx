"use client";

import React from "react";
import { Sun, Moon, Key, Check, X } from "lucide-react";

interface HeaderProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
  apiKey: string;
  saveApiKey: (key: string) => void;
  showKeyInput: boolean;
  setShowKeyInput: (show: boolean) => void;
}

export default function Header({
  theme,
  toggleTheme,
  apiKey,
  saveApiKey,
  showKeyInput,
  setShowKeyInput
}: HeaderProps) {
  const [tempKey, setTempKey] = React.useState(apiKey);

  React.useEffect(() => {
    setTempKey(apiKey);
  }, [apiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiKey(tempKey);
  };

  return (
    <>
      {/* Navigation / Header Brand */}
      <header className="w-full flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-2.5">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#d97754] via-[#e99f82] to-[#cc7b5c] font-sans">
              NovaCaption AI
            </span>
            <p className="text-[9px] text-zinc-500 font-medium font-sans">Video Captioning Suite</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* API Key configuration input field */}
          {showKeyInput ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg p-1 animate-in fade-in slide-in-from-right-4 duration-200">
              <input
                type="password"
                placeholder="Fireworks API Key"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="bg-transparent text-xs px-2 py-1 outline-none text-zinc-200 w-48 font-mono placeholder-zinc-600"
              />
              <button
                type="submit"
                className="p-1 rounded bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 cursor-pointer active:scale-95 transition-all"
                title="Save Key"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowKeyInput(false)}
                className="p-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 cursor-pointer active:scale-95 transition-all"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowKeyInput(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-md ${
                apiKey
                  ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400 hover:bg-emerald-950/30 hover:border-emerald-800"
                  : "bg-amber-950/20 border-amber-900/50 text-amber-400 hover:bg-amber-950/30 hover:border-amber-800 animate-pulse"
              }`}
              title="Configure Fireworks API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{apiKey ? "API Key Configured" : "Add API Key"}</span>
            </button>
          )}

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

          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${apiKey ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
            <span className="text-[10px] text-zinc-400 font-medium font-mono">
              {apiKey ? "Client Mode Active" : "Setup Required"}
            </span>
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
