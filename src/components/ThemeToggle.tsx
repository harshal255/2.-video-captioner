import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  if (!mounted) return (
    <div className="w-9 h-9 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center">
      <div className="w-4 h-4 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
    </div>
  );

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-9 h-9 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
      aria-label="Toggle dark and light theme"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700" />
      )}
    </button>
  );
}
