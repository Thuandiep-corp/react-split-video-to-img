export async function extractFrames(
  video,
  stepInterval = 3, // Bước nhảy 3 giây
  canvasWidth = 640,
  canvasHeight = 360
){
  try {
    const frames = [];

    // Tạo video element
    const videoElement = document.createElement('video');
    const videoUrl = URL.createObjectURL(video);
    videoElement.src = videoUrl;
    videoElement.crossOrigin = 'anonymous';
    videoElement.muted = true;

    // Tạo canvas
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(videoUrl);
      videoElement.remove();
      throw new Error('Không thể tạo canvas context');
    }

    // Hàm chờ video tải metadata
    const waitForVideo = () =>
      new Promise((resolve, reject) => {
        videoElement.onloadeddata = () => resolve();
        videoElement.onerror = () => reject(new Error('Lỗi tải video'));
      });

    await waitForVideo();

    // Hàm chụp khung hình
    const captureFrame = (time) =>
      new Promise((resolve, reject) => {
        videoElement.currentTime = time;
        videoElement.onseeked = () => {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Không thể tạo Blob'));
            },
            'image/png',
            1
          );
        };
      });

    for (let time = 0; time < videoElement.duration; time += stepInterval) {
      try {
        const frame = await captureFrame(time);
        frames.push(frame);
      } catch (error) {
        console.error(`Lỗi khi chụp khung hình tại thời điểm ${time}:`, error);
      }
    }

    URL.revokeObjectURL(videoUrl);
    videoElement.remove();
    return frames;
  } catch (error) {
    console.error('Lỗi trong quá trình trích xuất khung hình:', error);
    throw error;
  }
}