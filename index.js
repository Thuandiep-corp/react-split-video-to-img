/**
 * Trích xuất khung hình từ video thành mảng Blob
 * @param {File|Blob} video - File hoặc Blob video
 * @param {number} [stepInterval=3] - Bước nhảy giữa các khung hình (giây)
 * @param {number} [canvasWidth=640] - Chiều rộng canvas
 * @param {number} [canvasHeight=360] - Chiều cao canvas
 * @returns {Promise<Blob[]>} Mảng các Blob chứa khung hình PNG
 */
export default async function extractFrames(video, stepInterval = 3, canvasWidth = 640, canvasHeight = 360) {
  const frames = [];
  const videoElement = document.createElement('video');
  const videoUrl = URL.createObjectURL(video);
  videoElement.src = videoUrl;
  videoElement.crossOrigin = 'anonymous';
  videoElement.muted = true;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    URL.revokeObjectURL(videoUrl);
    videoElement.remove();
    throw new Error('Cannot create canvas context');
  }

  const waitForVideo = () =>
    new Promise((resolve, reject) => {
      videoElement.onloadeddata = resolve;
      videoElement.onerror = () => reject(new Error('Error loading video'));
    });

  const captureFrame = (time) =>
    new Promise((resolve, reject) => {
      videoElement.currentTime = time;
      videoElement.onseeked = () => {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Cannot create Blob'));
          },
          'image/png',
          0.8 // Nén PNG với chất lượng 80%
        );
      };
    });

  try {
    await waitForVideo();
    canvas.width = videoElement.videoWidth || canvasWidth;
    canvas.height = videoElement.videoHeight || canvasHeight;
    const duration = videoElement.duration;
    if (!duration) throw new Error('Cannot get video duration');

    const times = [];
    for (let t = 0; t < duration; t += stepInterval) {
      times.push(t);
    }

    for (const time of times) {
      const blob = await captureFrame(time);
      frames.push(blob);
    }
  } catch (error) {
    console.error('Error extracting frames:', error);
  } finally {
    URL.revokeObjectURL(videoUrl);
    videoElement.remove();
  }

  return frames;
}