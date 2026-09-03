import React from 'react';
import { Sliders, Hash, Clock, Zap, Image as ImageIcon, Monitor } from 'lucide-react';
import type { ExtractionOptions, ExtractionMode, ImageFormat } from '../utils/videoExtractor';

interface ExtractionSettingsProps {
  options: ExtractionOptions;
  onChange: (newOptions: ExtractionOptions) => void;
  onExtract: () => void;
  isProcessing: boolean;
  disabled: boolean;
}

export default function ExtractionSettings({
  options,
  onChange,
  onExtract,
  isProcessing,
  disabled
}: ExtractionSettingsProps) {

  const handleModeChange = (mode: ExtractionMode) => {
    let defaultValue = 10;
    if (mode === 'interval') defaultValue = 2;
    if (mode === 'fps') defaultValue = 1;

    onChange({
      ...options,
      mode,
      value: defaultValue
    });
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 backdrop-blur-xl flex flex-col gap-4 shadow-xl text-slate-900 dark:text-zinc-100 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
        <h2 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2 font-sans">
          <Sliders className="w-4 h-4 text-amber-500" />
          <span>Extraction Parameters</span>
        </h2>
        <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">100% Client-Side</span>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider font-sans">
          Extraction Mode
        </label>
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-zinc-950 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => handleModeChange('count')}
            className={`py-2 px-2 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              options.mode === 'count'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold'
                : 'text-slate-700 dark:text-zinc-400 font-semibold hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Frame Count</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('interval')}
            className={`py-2 px-2 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              options.mode === 'interval'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold'
                : 'text-slate-700 dark:text-zinc-400 font-semibold hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time Interval</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('fps')}
            className={`py-2 px-2 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              options.mode === 'fps'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-extrabold'
                : 'text-slate-700 dark:text-zinc-400 font-semibold hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Frame Rate</span>
          </button>
        </div>
      </div>

      {/* Dynamic Input Value per Mode */}
      <div className="flex flex-col gap-2 bg-slate-50 dark:bg-zinc-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800">
        {options.mode === 'count' && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-800 dark:text-zinc-200 font-bold">Total Keyframes to Extract:</span>
              <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                {options.value} Frames
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={100}
                step={1}
                value={options.value}
                onChange={(e) => onChange({ ...options, value: parseInt(e.target.value) || 1 })}
                className="flex-1 accent-amber-500 h-1.5 bg-slate-300 dark:bg-zinc-800 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min={1}
                max={300}
                value={options.value}
                onChange={(e) => onChange({ ...options, value: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-20 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-center text-slate-900 dark:text-zinc-100 font-mono font-bold focus:border-amber-500 focus:outline-none shadow-sm"
              />
            </div>
          </div>
        )}

        {options.mode === 'interval' && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-800 dark:text-zinc-200 font-bold">Extract 1 Frame Every:</span>
              <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                {options.value} Seconds
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0.1}
                max={30}
                step={0.1}
                value={options.value}
                onChange={(e) => onChange({ ...options, value: parseFloat(e.target.value) || 1 })}
                className="flex-1 accent-amber-500 h-1.5 bg-slate-300 dark:bg-zinc-800 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min={0.1}
                max={60}
                step={0.1}
                value={options.value}
                onChange={(e) => onChange({ ...options, value: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
                className="w-20 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-center text-slate-900 dark:text-zinc-100 font-mono font-bold focus:border-amber-500 focus:outline-none shadow-sm"
              />
            </div>
            <div className="flex gap-1.5 mt-1">
              {[0.5, 1, 2, 5, 10].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => onChange({ ...options, value: sec })}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded-md border transition-colors ${
                    options.value === sec
                      ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                      : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold hover:bg-slate-100'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        )}

        {options.mode === 'fps' && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-800 dark:text-zinc-200 font-bold">Frames Per Second (FPS):</span>
              <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                {options.value} FPS
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0.2}
                max={10}
                step={0.1}
                value={options.value}
                onChange={(e) => onChange({ ...options, value: parseFloat(e.target.value) || 1 })}
                className="flex-1 accent-amber-500 h-1.5 bg-slate-300 dark:bg-zinc-800 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min={0.1}
                max={30}
                step={0.1}
                value={options.value}
                onChange={(e) => onChange({ ...options, value: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
                className="w-20 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-center text-slate-900 dark:text-zinc-100 font-mono font-bold focus:border-amber-500 focus:outline-none shadow-sm"
              />
            </div>
            <div className="flex gap-1.5 mt-1">
              {[0.5, 1, 2, 5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => onChange({ ...options, value: rate })}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded-md border transition-colors ${
                    options.value === rate
                      ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                      : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold hover:bg-slate-100'
                  }`}
                >
                  {rate} FPS
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Format & Resolution Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1 font-sans">
            <ImageIcon className="w-3 h-3 text-amber-500" />
            Image Format
          </label>
          <select
            value={options.format}
            onChange={(e) => onChange({ ...options, format: e.target.value as ImageFormat })}
            className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 font-bold focus:border-amber-500 focus:outline-none cursor-pointer shadow-sm"
          >
            <option value="image/jpeg">JPEG (.jpg) - Balanced & Fast</option>
            <option value="image/png">PNG (.png) - Lossless HD</option>
            <option value="image/webp">WEBP (.webp) - Modern Web</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1 font-sans">
            <Monitor className="w-3 h-3 text-amber-500" />
            Max Resolution
          </label>
          <select
            value={options.maxDimension}
            onChange={(e) => onChange({ ...options, maxDimension: parseInt(e.target.value) || 0 })}
            className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 font-bold focus:border-amber-500 focus:outline-none cursor-pointer shadow-sm"
          >
            <option value={0}>Native (Original Video Size)</option>
            <option value={1920}>1080p Full HD (Max 1920px)</option>
            <option value={1280}>720p HD (Max 1280px)</option>
            <option value={854}>480p SD (Max 854px)</option>
          </select>
        </div>
      </div>

      {/* Extract Button */}
      <button
        type="button"
        onClick={onExtract}
        disabled={disabled || isProcessing}
        className="w-full mt-2 py-3.5 px-6 rounded-xl font-extrabold uppercase tracking-wider text-xs cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 font-sans"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            <span>Processing Keyframes...</span>
          </>
        ) : (
          <span>Extract Frames Now</span>
        )}
      </button>
    </div>
  );
}
