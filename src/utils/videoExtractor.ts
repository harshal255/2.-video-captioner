export type ExtractionMode = 'count' | 'interval' | 'fps';
export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ExtractionOptions {
  mode: ExtractionMode;
  value: number; // frame count, interval in seconds, or frames per second
  format: ImageFormat;
  quality: number; // 0.1 to 1.0 (for jpeg/webp)
  maxDimension: number; // 0 for original, 1920 for 1080p, 1280 for 720p, 854 for 480p
  startTimestamp?: number;
  endTimestamp?: number;
}

export interface ExtractedFrame {
  id: string;
  dataUrl: string;
  timestamp: number;
  frameIndex: number;
  format: string;
  width: number;
  height: number;
}

export const extractVideoFrames = (
  file: File,
  options: ExtractionOptions,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractedFrame[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const fileUrl = URL.createObjectURL(file);
    video.src = fileUrl;

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        const start = Math.max(0, options.startTimestamp ?? 0);
        const end = options.endTimestamp && options.endTimestamp > start
          ? Math.min(duration, options.endTimestamp)
          : duration;
        const rangeDuration = end - start;

        let timestamps: number[] = [];

        if (options.mode === 'count') {
          const count = Math.max(1, Math.round(options.value));
          if (count === 1) {
            timestamps = [start];
          } else {
            const step = rangeDuration / (count - 1);
            for (let i = 0; i < count; i++) {
              let t = start + step * i;
              if (i === count - 1) t = Math.max(start, end - 0.05); // stay within bounds
              timestamps.push(t);
            }
          }
        } else if (options.mode === 'interval') {
          const intervalSec = Math.max(0.1, options.value);
          let currentT = start;
          while (currentT <= end) {
            timestamps.push(currentT);
            currentT += intervalSec;
          }
          if (timestamps.length === 0) timestamps.push(start);
        } else if (options.mode === 'fps') {
          const fps = Math.max(0.1, options.value);
          const intervalSec = 1 / fps;
          let currentT = start;
          while (currentT <= end) {
            timestamps.push(currentT);
            currentT += intervalSec;
          }
          if (timestamps.length === 0) timestamps.push(start);
        }

        // Limit maximum frames to 300 safety threshold to avoid browser memory crash
        const safeTimestamps = timestamps.slice(0, 300);
        const total = safeTimestamps.length;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calculate resolution
        let width = video.videoWidth || 1280;
        let height = video.videoHeight || 720;
        const maxDim = options.maxDimension;

        if (maxDim > 0) {
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height >= width && height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const results: ExtractedFrame[] = [];

        for (let i = 0; i < safeTimestamps.length; i++) {
          const seekTime = safeTimestamps[i];

          await new Promise<void>((res) => {
            const onSeeked = () => {
              video.removeEventListener("seeked", onSeeked);
              // Delay slightly for smooth frame decoder rendering
              setTimeout(res, 120);
            };
            video.addEventListener("seeked", onSeeked);
            video.currentTime = seekTime;
          });

          if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);
            const dataUrl = canvas.toDataURL(options.format, options.quality);
            results.push({
              id: `frame_${i + 1}_${Math.round(seekTime * 100)}`,
              dataUrl,
              timestamp: seekTime,
              frameIndex: i + 1,
              format: options.format.split('/')[1].toUpperCase(),
              width,
              height
            });
          }

          if (onProgress) {
            onProgress(i + 1, total);
          }
        }

        URL.revokeObjectURL(fileUrl);
        resolve(results);
      } catch (err) {
        URL.revokeObjectURL(fileUrl);
        reject(err);
      }
    };

    video.onerror = (err) => {
      URL.revokeObjectURL(fileUrl);
      reject(err);
    };
  });
};
