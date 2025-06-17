export default function extractFrames(
  video: File | Blob,
  stepInterval?: number,
  canvasWidth?: number,
  canvasHeight?: number
): Promise<Blob[]>;