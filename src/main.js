export async function extractFrames(
  video,
  stepInterval = 3, // Bước nhảy 3 giây
  canvasWidth = 640,
  canvasHeight = 360
){
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

  // Hàm chụp khung hình
  const captureFrame = (time) =>
    new Promise<Blob>((resolve, reject) => {
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

  try {
    // Chờ video tải metadata
    await waitForVideo();

    // Đặt kích thước canvas dựa trên video
    canvas.width = videoElement.videoWidth || canvasWidth;
    canvas.height = videoElement.videoHeight || canvasHeight;

    // Lấy độ dài video
    const duration = videoElement.duration;
    if (!duration) throw new Error('Không lấy được độ dài video');

    // Tạo mốc thời gian với bước nhảy 3 giây
    const times = [];
    for (let t = 0; t < duration; t += stepInterval) {
      times.push(t);
    }

    // Chụp từng khung hình
    for (const time of times) {
      const blob = await captureFrame(time);
      frames.push(blob);
    }
  } catch (error) {
    console.error('Lỗi trích xuất khung hình:', error);
  } finally {
    URL.revokeObjectURL(videoUrl);
    videoElement.remove();
  }

  return frames;
}