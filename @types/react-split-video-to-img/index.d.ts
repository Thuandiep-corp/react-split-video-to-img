declare module 'react-split-video-to-img' {
  export function extractFrames(videoFile: File): Promise<Blob[]>;
}
