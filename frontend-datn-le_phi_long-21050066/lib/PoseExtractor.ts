let poseInstance: any = null;
let poseLoaded = false;

async function getPoseInstance(): Promise<any> {
  if (poseInstance && poseLoaded) return poseInstance;
  if (typeof window === 'undefined') throw new Error('Chỉ chạy được trên browser!');
  if (typeof (window as any).Pose !== 'function') {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
      script.async = true;
      script.onload = () => typeof (window as any).Pose === 'function' ? resolve() : reject('Không load được pose.js');
      script.onerror = () => reject('Không thể load mediapipe/pose.js!');
      document.body.appendChild(script);
    });
  }
  const Pose = (window as any).Pose;
  poseInstance = new Pose({
    locateFile: (file: string) => `/mediapipe/pose/${file}`,
  });
  poseInstance.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    minDetectionConfidence: 0.8,
    minTrackingConfidence: 0.8,
  });
  poseLoaded = true;
  return poseInstance;
}

async function resizeImageFile(file: File, maxSize: number = 400): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) {
          height = Math.round(height * (maxSize / width));
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round(width * (maxSize / height));
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      const resizedImg = document.createElement('img');
      resizedImg.onload = () => resolve(resizedImg);
      resizedImg.onerror = reject;
      resizedImg.src = canvas.toDataURL('image/jpeg', 0.85);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function extractPoseKeypointsForImage(file: File): Promise<number[][] | null> {
  const pose = await getPoseInstance();

  const resultQueue: Array<(r: any) => void> = [];
  pose.onResults((results: any) => {
    const resolver = resultQueue.shift();
    if (resolver) resolver(results);
  });

  // Resize trước khi extract!
  const img = await resizeImageFile(file, 400);

  const results = await new Promise<any>((resolve) => {
    resultQueue.push(resolve);
    pose.send({ image: img });
  });

  if (results?.poseLandmarks) {
    return results.poseLandmarks.map((lm: any) => [lm.x, lm.y, lm.z]);
  }
  return null;
}

export async function extractPoseKeypoints(
  images: { file: File, label: string }[]
): Promise<Record<string, number[][][]>> {
  const grouped: Record<string, number[][][]> = {};
  for (let i = 0; i < images.length; i++) {
    const { file, label } = images[i];
    const keypoints = await extractPoseKeypointsForImage(file);
    if (keypoints) {
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(keypoints);
    }
  }
  return grouped;
}
