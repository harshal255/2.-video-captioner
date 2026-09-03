import React, { useState } from 'react';
import { Film, Download, Copy, Check, Grid, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ExtractedFrame } from '../utils/videoExtractor';
import { downloadFramesAsZip } from '../utils/zipExporter';
import toast from 'react-hot-toast';

interface FrameGalleryProps {
  frames: ExtractedFrame[];
  videoFileName: string;
}

export default function FrameGallery({ frames, videoFileName }: FrameGalleryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<ExtractedFrame | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  if (!frames || frames.length === 0) return null;

  const totalPages = Math.ceil(frames.length / pageSize);
  const displayedFrames = frames.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDownloadSingle = (frame: ExtractedFrame) => {
    const link = document.createElement('a');
    const ext = frame.format.toLowerCase() === 'jpeg' ? 'jpg' : frame.format.toLowerCase();
    const padIndex = String(frame.frameIndex).padStart(3, '0');
    link.download = `frame-${padIndex}-${Math.round(frame.timestamp)}s.${ext}`;
    link.href = frame.dataUrl;
    link.click();
    toast.success(`Frame ${frame.frameIndex} downloaded!`);
  };

  const handleCopyImage = async (frame: ExtractedFrame) => {
    try {
      const res = await fetch(frame.dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopiedId(frame.id);
      toast.success(`Frame ${frame.frameIndex} copied to clipboard!`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      toast.error("Failed to copy image to clipboard.");
    }
  };

  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    const toastId = toast.loading("Packaging frames into ZIP...");
    try {
      await downloadFramesAsZip(frames, videoFileName);
      toast.success(`Downloaded ${frames.length} frames in ZIP!`, { id: toastId });
    } catch (e) {
      toast.error("Failed to generate ZIP archive.", { id: toastId });
    } finally {
      setIsZipping(false);
    }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleExportStoryboardGrid = async () => {
    const toastId = toast.loading("Compiling high-res storyboard grid...");
    try {
      const loadedImgs = await Promise.all(frames.slice(0, 36).map(f => loadImage(f.dataUrl)));
      if (loadedImgs.length === 0) return;

      const frameW = loadedImgs[0].width;
      const frameH = loadedImgs[0].height;

      const cols = loadedImgs.length <= 4 ? loadedImgs.length : Math.ceil(Math.sqrt(loadedImgs.length * 1.5));
      const rows = Math.ceil(loadedImgs.length / cols);

      const gap = 20;
      const padding = 30;
      const headerHeight = 60;

      const canvasW = cols * frameW + (cols - 1) * gap + padding * 2;
      const canvasH = rows * frameH + (rows - 1) * gap + padding * 2 + headerHeight;

      const canvas = document.createElement("canvas");
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, canvasW, canvasH);

      ctx.fillStyle = "#f59e0b";
      ctx.font = `bold ${Math.max(20, Math.round(frameW * 0.04))}px 'Neue Kabel', sans-serif`;
      ctx.fillText(`STORYBOARD GRID — ${videoFileName.toUpperCase()}`, padding, padding + 24);

      ctx.fillStyle = "#71717a";
      ctx.font = `medium ${Math.max(12, Math.round(frameW * 0.025))}px 'Neue Kabel', sans-serif`;
      ctx.fillText(`${frames.length} Total Frames Extracted via FrameCraft Micro Tool`, padding, padding + 48);

      loadedImgs.forEach((img, index) => {
        const r = Math.floor(index / cols);
        const c = index % cols;

        const x = padding + c * (frameW + gap);
        const y = padding + headerHeight + r * (frameH + gap);

        ctx.drawImage(img, x, y, frameW, frameH);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = Math.max(2, Math.round(frameW * 0.004));
        ctx.strokeRect(x, y, frameW, frameH);

        const badgeText = `Frame ${index + 1}`;
        const fontSize = Math.max(12, Math.round(frameH * 0.045));
        ctx.font = `bold ${fontSize}px 'Neue Kabel', sans-serif`;
        const textMetrics = ctx.measureText(badgeText);
        const textW = textMetrics.width;
        const textH = fontSize;

        const badgeX = x + 12;
        const badgeY = y + frameH - 12;

        ctx.fillStyle = "rgba(9, 9, 11, 0.85)";
        ctx.fillRect(badgeX - 6, badgeY - textH - 4, textW + 12, textH + 8);

        ctx.fillStyle = "#f59e0b";
        ctx.fillText(badgeText, badgeX, badgeY - 2);
      });

      const gridDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setPreviewImageSrc(gridDataUrl);
      setIsPreviewOpen(true);
      toast.success("Storyboard grid compiled!", { id: toastId });
    } catch (err) {
      toast.error("Failed to build storyboard grid.", { id: toastId });
    }
  };

  const formatTimestamp = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.round((sec % 1) * 10);
    return `${m}:${s < 10 ? '0' : ''}${s}.${ms}s`;
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Header bar with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 backdrop-blur-xl shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-sans">
              Extracted Keyframes ({frames.length})
            </h3>
            <p className="text-[10px] text-slate-600 dark:text-zinc-400">
              Format: {frames[0]?.format} • Res: {frames[0]?.width}x{frames[0]?.height}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportStoryboardGrid}
            className="py-2 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-950 hover:bg-slate-200 dark:hover:bg-zinc-800 text-amber-600 dark:text-amber-400 border border-slate-300 dark:border-zinc-800 transition-all cursor-pointer flex items-center gap-1.5 font-sans shadow-sm"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Storyboard Grid</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadAllZip}
            disabled={isZipping}
            className="py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 font-sans shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isZipping ? "Creating ZIP..." : `Download ZIP (${frames.length})`}</span>
          </button>
        </div>
      </div>

      {/* Frame Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {displayedFrames.map((frame) => (
          <div
            key={frame.id}
            onClick={() => setSelectedFrame(frame)}
            className="group relative flex flex-col rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-500 transition-all duration-200 cursor-pointer shadow-md hover:scale-[1.02]"
          >
            {/* Image Box */}
            <div className="w-full aspect-video bg-black overflow-hidden relative">
              <img
                src={frame.dataUrl}
                alt={`Frame ${frame.frameIndex}`}
                className="w-full h-full object-cover select-none"
                loading="lazy"
              />

              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-zinc-950/85 border border-zinc-800 text-[9px] font-mono font-semibold text-amber-400">
                #{frame.frameIndex}
              </div>

              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-zinc-950/85 border border-zinc-800 text-[8px] font-mono text-zinc-300">
                {formatTimestamp(frame.timestamp)}
              </div>

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyImage(frame);
                  }}
                  className="p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-amber-400 transition-colors"
                  title="Copy frame image"
                >
                  {copiedId === frame.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadSingle(frame);
                  }}
                  className="p-2 rounded-lg bg-amber-500 border border-amber-400 text-zinc-950 hover:bg-amber-400 transition-colors"
                  title="Download frame"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card info footer */}
            <div className="px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-950/90 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-[9px] font-mono text-slate-600 dark:text-zinc-400 font-semibold">
              <span>{frame.width}x{frame.height}</span>
              <span>{frame.format}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination control */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3 py-2">
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-amber-500 disabled:opacity-40 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-700 dark:text-zinc-300 font-bold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-amber-500 disabled:opacity-40 shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedFrame && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedFrame(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-4xl w-full p-5 flex flex-col gap-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-amber-500">
                  Frame #{selectedFrame.frameIndex}
                </span>
                <span className="text-xs text-slate-600 dark:text-zinc-400 font-semibold">
                  ({formatTimestamp(selectedFrame.timestamp)})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFrame(null)}
                className="p-1 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full max-h-[70vh] flex items-center justify-center bg-black rounded-xl overflow-hidden p-2">
              <img
                src={selectedFrame.dataUrl}
                alt={`Frame ${selectedFrame.frameIndex}`}
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-mono text-slate-600 dark:text-zinc-400 font-semibold">
                Resolution: {selectedFrame.width} x {selectedFrame.height} | Format: {selectedFrame.format}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleCopyImage(selectedFrame)}
                  className="py-2 px-4 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 hover:bg-slate-200"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(selectedFrame)}
                  className="py-2 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Frame</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Storyboard Grid Preview Modal */}
      {isPreviewOpen && previewImageSrc && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-5xl w-full p-6 flex flex-col gap-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-sans">
                  Storyboard Grid Export Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full max-h-[65vh] overflow-y-auto rounded-xl border border-slate-200 dark:border-zinc-800 bg-black p-3 flex items-center justify-center">
              <img
                src={previewImageSrc}
                alt="Storyboard Grid Preview"
                className="max-w-full h-auto object-contain rounded-lg shadow-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="py-2 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-zinc-800 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `storyboard-grid-${Date.now()}.jpg`;
                  link.href = previewImageSrc;
                  link.click();
                  toast.success("Storyboard grid downloaded!");
                  setIsPreviewOpen(false);
                }}
                className="py-2.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-lg flex items-center gap-1.5 font-sans"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Storyboard Grid (.JPG)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
