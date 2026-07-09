// Helper to resample AudioBuffer to 16kHz mono in the browser
export const resampleAudio = async (audioBuffer: AudioBuffer): Promise<AudioBuffer> => {
  const targetSampleRate = 16000;
  const offlineCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
    1, // mono
    Math.ceil(audioBuffer.duration * targetSampleRate),
    targetSampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start();

  return await offlineCtx.startRendering();
};

// Helper to convert resampled AudioBuffer to mono WAV PCM blob
export const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const sampleRate = buffer.sampleRate;
  const numOfChan = 1;
  const bitDepth = 16;
  const length = buffer.length * 2; // 16-bit is 2 bytes
  const bufferArr = new ArrayBuffer(44 + length);
  const view = new DataView(bufferArr);

  // RIFF identifier
  writeString(view, 0, "RIFF");
  // file length minus RIFF header length
  view.setUint32(4, 36 + length, true);
  // RIFF type
  writeString(view, 8, "WAVE");
  // format chunk identifier
  writeString(view, 12, "fmt ");
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numOfChan, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(view, 36, "data");
  // data chunk length
  view.setUint32(40, length, true);

  // Write PCM audio samples
  const channelData = buffer.getChannelData(0);
  let offset = 44;
  for (let i = 0; i < channelData.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: "audio/wav" });
};

// Main audio extraction handler
export const extractAudio = async (file: File): Promise<Blob | null> => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;

  const audioCtx = new AudioContextClass();

  try {
    const arrayBuffer = await file.arrayBuffer();
    // decodeAudioData consumes the arrayBuffer, so we copy it or read it
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const resampled = await resampleAudio(audioBuffer);
    return audioBufferToWav(resampled);
  } catch (e) {
    console.warn("Failed to extract audio track (video might have no audio track):", e);
    return null;
  } finally {
    audioCtx.close();
  }
};
