"use client";

import React, { useState, useRef, useEffect } from "react";
import { Cpu, ChevronDown, Check } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function ModelSelector({
  selectedModel,
  onModelChange
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const presetModels = [
    {
      id: "accounts/fireworks/models/kimi-k2p6",
      name: "Kimi K2.6 Vision (Active & Supported)"
    },
    {
      id: "accounts/fireworks/models/kimi-k2p5",
      name: "Kimi K2.5 Vision (Active & Supported)"
    },
    {
      id: "accounts/fireworks/models/llama-v3p2-11b-vision-instruct",
      name: "Llama 3.2 11B Vision (May require model activation)"
    },
    {
      id: "accounts/fireworks/models/qwen2-vl-7b-instruct",
      name: "Qwen 2 VL 7B (May require model activation)"
    }
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (modelId: string) => {
    if (modelId === "custom") {
      setIsCustom(true);
      onModelChange(customInput || "accounts/fireworks/models/kimi-k2p6");
    } else {
      setIsCustom(false);
      onModelChange(modelId);
    }
    setIsOpen(false);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    onModelChange(val);
  };

  // Find active preset name
  const activePreset = presetModels.find(m => m.id === selectedModel);
  const displayName = isCustom
    ? "Custom Model"
    : activePreset
      ? activePreset.name
      : selectedModel;

  return (
    <div className="w-full flex flex-col gap-2 relative" ref={dropdownRef} id="model-selector-container">
      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
        <Cpu className="w-3.5 h-3.5 text-amber-500" />
        AI Vision Model
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 transition-all flex items-center justify-between cursor-pointer focus:border-amber-500 focus:outline-none"
        id="select-model-trigger"
      >
        <span className="font-medium text-left truncate">{displayName}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Custom Dropdown Content */}
      {isOpen && (
        <div className="absolute top-[4.5rem] left-0 w-full bg-[#0c0c0e] border border-zinc-800 text-zinc-200 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.65)] p-1.5 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {presetModels.map((model) => (
            <button
              type="button"
              key={model.id}
              onClick={() => handleSelect(model.id)}
              className={`w-full text-left cursor-pointer hover:bg-zinc-900/80 hover:text-zinc-100 rounded-lg py-2.5 px-3 text-xs transition-colors flex items-center justify-between ${selectedModel === model.id && !isCustom ? "bg-zinc-900 text-amber-500" : ""
                }`}
            >
              <span className="font-medium">{model.name}</span>
              {selectedModel === model.id && !isCustom && <Check className="w-3.5 h-3.5 text-amber-500" />}
            </button>
          ))}

          <div className="h-px bg-zinc-900/60 my-1" />

          <button
            type="button"
            onClick={() => handleSelect("custom")}
            className={`w-full text-left cursor-pointer hover:bg-zinc-900/80 hover:text-zinc-100 rounded-lg py-2.5 px-3 text-xs transition-colors flex items-center justify-between ${isCustom ? "bg-zinc-900 text-amber-500" : ""
              }`}
          >
            <span className="font-medium">Custom Model (Enter below...)</span>
            {isCustom && <Check className="w-3.5 h-3.5 text-amber-500" />}
          </button>
        </div>
      )}

      {isCustom && (
        <div className="mt-1 animate-in fade-in duration-200" id="custom-model-input-container">
          <input
            type="text"
            value={customInput}
            onChange={handleCustomInputChange}
            placeholder="e.g., accounts/fireworks/models/qwen2-vl-72b-instruct"
            className="w-full bg-zinc-950/40 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:border-amber-500 focus:outline-none placeholder-zinc-700 hover:border-zinc-700 transition-colors font-medium"
            id="input-custom-model"
          />
          <p className="text-[9px] text-zinc-500 mt-1 pl-1">
            Specify the full Fireworks model endpoint name.
          </p>
        </div>
      )}
    </div>
  );
}
