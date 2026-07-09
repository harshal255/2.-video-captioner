"use client";

import React, { useState, useRef } from "react";
import { Film, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { toast } from "react-hot-toast";

interface FrameStripProps {
  frames: string[];
}

export default function FrameStrip({ frames }: FrameStripProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleDownloadSingle = (e: React.MouseEvent, frame: string, index: number) => {
    e.stopPropagation(); // prevent carousel selection
    const link = document.createElement("a");
    link.download = `frame-${index + 1}-${Date.now()}.jpg`;
    link.href = frame;
    link.click();
    toast.success(`Frame ${index + 1} downloaded in high resolution!`);
  };

  const handleDownloadStoryboard = () => {
    if (!previewImageSrc) return;
    const link = document.createElement("a");
    link.download = `storyboard-grid-${Date.now()}.jpg`;
    link.href = previewImageSrc;
    link.click();
    setIsPreviewOpen(false);
    setPreviewImageSrc(null);
    toast.success("Storyboard grid downloaded!");
  };

  if (frames.length === 0) return null;

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % frames.length;
    setActiveIndex(nextIndex);
    scrollToItem(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + frames.length) % frames.length;
    setActiveIndex(prevIndex);
    scrollToItem(prevIndex);
  };

  const handleSelect = (index: number) => {
    setActiveIndex(index);
    scrollToItem(index);
  };

  const scrollToItem = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const items = container.children;
    if (items[index]) {
      const item = items[index] as HTMLElement;
      container.scrollTo({
        left: item.offsetLeft - container.clientWidth / 2 + item.clientWidth / 2,
        behavior: "smooth"
      });
    }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  };

  const handleExportGrid = async () => {
    try {
      toast.loading("Compiling storyboard grid...", { id: "exporting" });
      const loadedImages = await Promise.all(frames.map(loadImage));

      const frameW = loadedImages[0].width;
      const frameH = loadedImages[0].height;

      const cols = frames.length <= 4 ? frames.length : Math.ceil(frames.length / 2);
      const rows = Math.ceil(frames.length / cols);

      const gap = 16;
      const padding = 24;

      const canvasW = cols * frameW + (cols - 1) * gap + padding * 2;
      const canvasH = rows * frameH + (rows - 1) * gap + padding * 2;

      const canvas = document.createElement("canvas");
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        toast.dismiss("exporting");
        toast.error("Failed to initialize canvas context.");
        return;
      }

      ctx.fillStyle = "#08080a";
      ctx.fillRect(0, 0, canvasW, canvasH);

      loadedImages.forEach((img, index) => {
        const r = Math.floor(index / cols);
        const c = index % cols;

        const x = padding + c * (frameW + gap);
        const y = padding + r * (frameH + gap);

        ctx.drawImage(img, x, y, frameW, frameH);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = Math.max(2, Math.round(frameW * 0.005));
        ctx.strokeRect(x, y, frameW, frameH);

        const badgeText = `Frame ${index + 1}`;
        const fontSize = Math.max(12, Math.round(frameH * 0.045));
        ctx.font = `bold ${fontSize}px sans-serif`;

        const textMetrics = ctx.measureText(badgeText);
        const textW = textMetrics.width;
        const textH = fontSize;

        const badgePadX = 8;
        const badgePadY = 6;
        const badgeX = x + 12;
        const badgeY = y + frameH - 12;

        ctx.fillStyle = "rgba(12, 12, 14, 0.85)";
        ctx.beginPath();
        ctx.roundRect(
          badgeX - badgePadX,
          badgeY - textH - badgePadY,
          textW + badgePadX * 2,
          textH + badgePadY * 2,
          6
        );
        ctx.fill();

        ctx.fillStyle = "#d4a040";
        ctx.fillText(badgeText, badgeX, badgeY - 2);
      });

      const url = canvas.toDataURL("image/jpeg", 0.9);
      setPreviewImageSrc(url);
      setIsPreviewOpen(true);

      toast.dismiss("exporting");
      toast.success("Storyboard grid compiled successfully!");
    } catch (err) {
      console.error(err);
      toast.dismiss("exporting");
      toast.error("Failed to export storyboard grid.");
    }
  };

  return (
    <div className="w-full mt-5 border-t border-zinc-900/60 pt-4 animate-in fade-in duration-200" id="frame-strip-container">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
          <Film className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          Extracted Keyframe Carousel
        </h3>
        <span className="text-[9px] text-zinc-500 bg-zinc-900/60 border border-zinc-800/80 px-2 py-0.5 rounded-full font-medium font-sans">
          Active: Frame {activeIndex + 1} / {frames.length}
        </span>
      </div>

      {/* Compact Carousel Deck (Multiple slides peeking, small size, no fixed parent height) */}
      <div className="relative w-full flex items-center bg-zinc-950/30 border border-zinc-900/80 rounded-xl p-2.5" id="frames-carousel">

        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-2 p-1.5 rounded-lg border border-zinc-850 bg-zinc-900/80 text-zinc-450 hover:text-amber-500 transition-all cursor-pointer z-10 active:scale-90 hover:border-amber-500/20 shadow-md"
          aria-label="Previous frame"
          id="btn-carousel-prev"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontal Slides Deck */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3 overflow-x-auto w-full px-8 py-1 scrollbar-none scroll-smooth"
          id="carousel-slides-container"
        >
          {frames.map((frame, index) => {
            const isActive = activeIndex === index;
            return (
              <div
                key={index}
                onClick={() => handleSelect(index)}
                className={`flex-shrink-0 w-28 transition-all duration-300 cursor-pointer ${isActive
                  ? "scale-[1.04] opacity-100"
                  : "opacity-40 hover:opacity-75"
                  }`}
                id={`carousel-slide-item-${index}`}
              >
                {/* Image card preserving aspect ratio with no fixed height */}
                <div
                  className={`w-full rounded-lg overflow-hidden border transition-all duration-300 relative group/slide ${isActive
                    ? "border-amber-500 shadow-[0_0_12px_rgba(212,160,64,0.2)] bg-zinc-950"
                    : "border-zinc-800 bg-zinc-950/60"
                    }`}
                  id={`carousel-slide-wrapper-${index}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={frame}
                    alt={`Frame ${index + 1}`}
                    className="w-full h-auto block select-none"
                    id={`carousel-img-item-${index}`}
                  />

                  {/* Hover Overlay Download Trigger */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/slide:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                    <button
                      onClick={(e) => handleDownloadSingle(e, frame, index)}
                      className="p-1.5 rounded-md bg-zinc-950 hover:bg-zinc-900 text-primary hover:text-primary/90 border border-zinc-800 active:scale-90 hover:scale-105 transition-all cursor-pointer shadow-lg"
                      title="Download high-resolution frame"
                      id={`btn-download-single-${index}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Center Badge indicator */}
                <div className={`text-center text-[9px] font-mono mt-1 transition-colors ${isActive ? "text-primary font-bold" : "text-zinc-500"
                  }`}>
                  F{index + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-2 p-1.5 rounded-lg border border-border bg-secondary/80 text-muted-foreground hover:text-primary transition-all cursor-pointer z-10 active:scale-90 hover:border-primary/20 shadow-md"
          aria-label="Next frame"
          id="btn-carousel-next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

      {/* Download Storyboard Grid Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleExportGrid}
          className="py-1.5 px-4 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-secondary/80 hover:bg-secondary/90 text-primary border border-border hover:border-primary/30 active:scale-95 transition-all cursor-pointer shadow-sm font-sans"
          id="btn-export-storyboard"
        >
          <Download className="w-3.5 h-3.5" />
          Export Storyboard Grid
        </button>
      </div>

      {/* Custom Storyboard Preview Modal */}
      {isPreviewOpen && previewImageSrc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200" id="storyboard-preview-modal">
          <div className="bg-card border border-border rounded-2xl max-w-4xl w-full p-6 flex flex-col gap-4 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest font-sans flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-primary" />
              Storyboard Grid Preview
            </h3>

            {/* Scrollable Preview Area */}
            <div className="w-full max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-secondary/40 p-2.5 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageSrc}
                alt="Storyboard Grid Preview"
                className="max-w-full h-auto object-contain rounded-lg border border-border shadow-lg"
              />
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => {
                  setIsPreviewOpen(false);
                  setPreviewImageSrc(null);
                }}
                className="py-2 px-5 rounded-lg text-xs font-bold uppercase tracking-wider border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all cursor-pointer font-sans"
                id="btn-close-modal"
              >
                Close
              </button>
              <button
                onClick={handleDownloadStoryboard}
                className="py-2 px-5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all cursor-pointer font-sans shadow-md"
                id="btn-confirm-download-storyboard"
              >
                <Download className="w-3.5 h-3.5" />
                Download Storyboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
