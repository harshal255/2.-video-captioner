import JSZip from 'jszip';
import type { ExtractedFrame } from './videoExtractor';

export const downloadFramesAsZip = async (
  frames: ExtractedFrame[],
  videoFileName: string = 'video'
): Promise<void> => {
  if (!frames || frames.length === 0) return;

  const zip = new JSZip();
  const cleanName = videoFileName.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9_-]/gi, "_");
  const folder = zip.folder(`${cleanName}_extracted_frames`);

  frames.forEach((frame) => {
    // dataUrl format: data:image/png;base64,....
    const matches = frame.dataUrl.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const base64Data = matches[2];
      const padIndex = String(frame.frameIndex).padStart(3, '0');
      const timeFormatted = frame.timestamp.toFixed(2).replace('.', 's');
      const filename = `frame_${padIndex}_at_${timeFormatted}.${ext}`;
      folder?.file(filename, base64Data, { base64: true });
    }
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${cleanName}_frames_${Date.now()}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 1000);
};
