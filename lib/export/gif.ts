export async function createBoomerangGifBlob(
  frameBlobs: Blob[],
  delayMs: number = 100
): Promise<Blob> {
  if (frameBlobs.length === 0) {
    throw new Error('No frames provided for boomerang creation');
  }

  // Create forward + backward boomerang frame sequence
  const forwardFrames = [...frameBlobs];
  const backwardFrames = [...frameBlobs].reverse().slice(1, -1);
  const totalSequence = [...forwardFrames, ...backwardFrames];

  // Load image frames
  const loadedImages: HTMLImageElement[] = await Promise.all(
    totalSequence.map(
      (blob) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          const url = URL.createObjectURL(blob);
          img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load frame for gif'));
          };
          img.src = url;
        })
    )
  );

  const canvas = document.createElement('canvas');
  const firstImg = loadedImages[0];
  canvas.width = firstImg.width || 640;
  canvas.height = firstImg.height || 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  // Use canvas WebM / MediaRecorder fallback if available, else first frame JPEG fallback
  if (typeof MediaRecorder !== 'undefined' && canvas.captureStream) {
    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];

    return new Promise((resolve) => {
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        resolve(new Blob(chunks, { type: 'video/webm' }));
      };

      mediaRecorder.start();

      let frameIdx = 0;
      const interval = setInterval(() => {
        if (frameIdx >= loadedImages.length * 2) {
          clearInterval(interval);
          mediaRecorder.stop();
          return;
        }
        const currentImg = loadedImages[frameIdx % loadedImages.length];
        ctx.drawImage(currentImg, 0, 0, canvas.width, canvas.height);
        frameIdx++;
      }, delayMs);
    });
  }

  // Fallback to first frame JPEG
  ctx.drawImage(firstImg, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed frame export'));
    }, 'image/jpeg', 0.9);
  });
}
