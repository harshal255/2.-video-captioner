// Client-side HTML5 canvas keyframe extraction helper (with start/end timestamp bounds)
export const extractFrames = (
  file: File,
  frameCount: number,
  startTimestamp: number = 0,
  endTimestamp: number = 0
): Promise<string[]> => {
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
        const start = startTimestamp;
        const end = endTimestamp > 0 ? Math.min(duration, endTimestamp) : duration;
        const rangeDuration = end - start;

        const extractedFrames: string[] = [];
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Resize frames while preserving natural aspect ratio (Full HD 1080p resolution for local downloads)
        const maxDimension = 1920;
        let width = video.videoWidth;
        let height = video.videoHeight;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;

        // Spread out extraction points evenly from start to end of trimmed range
        const interval = frameCount > 1 ? rangeDuration / (frameCount - 1) : 0;

        for (let i = 0; i < frameCount; i++) {
          let seekTime = start + (interval * i);
          if (i === 0) {
            seekTime = start;
          } else if (i === frameCount - 1) {
            // Set slightly before final duration to avoid seek failures on some browsers
            seekTime = Math.max(start, end - 0.08);
          }

          await new Promise<void>((res) => {
            const onSeeked = () => {
              video.removeEventListener("seeked", onSeeked);
              // Delay 150ms to allow the browser's hardware decoder to fully paint the high-resolution frame texture
              setTimeout(res, 150);
            };
            video.addEventListener("seeked", onSeeked);
            video.currentTime = seekTime;
          });

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Store as high-quality JPEGs for local previews and downloads
            const base64 = canvas.toDataURL("image/jpeg", 0.95);
            extractedFrames.push(base64);
          }
        }

        URL.revokeObjectURL(fileUrl);
        resolve(extractedFrames);
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

// Client-side image compression helper for API transit payloads
export const compressFrameForApi = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const maxDimension = 480;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      canvas.width = width;
      canvas.height = height;
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.4));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
    img.src = base64Str;
  });
};
