// File: PoseExtractor.ts
// Đơn giản, đúng mục tiêu: chỉ load Pose và extract keypoints!

export async function initPoseExtractor() {
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
    // Trả về instance mỗi lần gọi (không cần singleton, để code dễ test/debug)
    const Pose = (window as any).Pose;
    const pose = new Pose({
      locateFile: (file: string) => `/mediapipe/pose/${file}`,
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.8,
    });
    return pose;
  }
  
  // Hàm rút trích đặc trưng cho 1 ảnh
  export async function extract(file: File, pose: any): Promise<number[][] | null> {
  
    return new Promise((resolve, reject) => {
      pose.onResults((results: any) => {
        if (results?.poseLandmarks) {
          // Kết quả là mảng [x, y, z]
          resolve(results.poseLandmarks.map((lm: any) => [lm.x, lm.y, lm.z]));
        } else {
          resolve(null);
        }
      });
  
      // Load ảnh lên, gửi cho pose
      const img = document.createElement('img');
      img.onload = () => pose.send({ image: img });
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  
  // Hàm rút trích đặc trưng cho nhiều ảnh
  export async function extractFromImages(images: { file: File, label: string }[], pose: any): Promise<Record<string, number[][][]>> {
    const grouped: Record<string, number[][][]> = {};
    for (const { file, label } of images) {
      const keypoints = await extract(file, pose);
      if (keypoints) {
        if (!grouped[label]) grouped[label] = [];
        grouped[label].push(keypoints);
      }
    }
    return grouped;
  }
  