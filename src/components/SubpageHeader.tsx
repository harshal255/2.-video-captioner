"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";

interface SubpageHeaderProps {
  title: string;
  subtitle: string;
}

export default function SubpageHeader({ title, subtitle }: SubpageHeaderProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("novacaption-theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
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
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <header className="w-full flex flex-col gap-4 border-b border-zinc-900 pb-4 mb-6">
      {/* Top row */}
      <div className="w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer" title="Go to home dashboard">
          <div className="flex flex-col">
            <span className="text-xs font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#d97754] via-[#e99f82] to-[#cc7b5c] font-sans">
              NovaCaption AI
            </span>
            <p className="text-[9px] text-zinc-500 font-medium font-sans">Video Captioning Suite</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-primary hover:border-zinc-700 transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            id="subpage-theme-toggle-btn"
          >
            {mounted && theme === "dark" ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
            <span className="text-[10px] text-zinc-400 font-medium font-mono">Vision API Ready</span>
          </div>
        </div>
      </div>

      {/* Title block */}
      <div className="flex flex-col gap-1.5 mt-2">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent font-sans">
          {title}
        </h1>
        <p className="text-xs text-zinc-500 font-medium pl-0.5 font-sans">
          {subtitle}
        </p>
      </div>
    </header>
  );
}
