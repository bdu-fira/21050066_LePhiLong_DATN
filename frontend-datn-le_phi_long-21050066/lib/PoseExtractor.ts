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
    const Pose = (window as any).Pose;
    const pose = new Pose({
      locateFile: (file: string) => `/mediapipe/pose/${file}`,
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      minDetectionConfidence: 0.85,
      minTrackingConfidence: 0.85,
    });
    return pose;
  }
  
  export async function extract(file: File, pose: any): Promise<number[][] | null> {
    return new Promise((resolve, reject) => {
      pose.onResults((results: any) => {
        if (results?.poseWorldLandmarks) {
          // Kết quả là mảng [x, y, z]
          resolve(results.poseWorldLandmarks.map((lm: any) => [lm.x, lm.y, lm.z]));
        } else {
          resolve(null);
        }
      });
  
      const img = document.createElement('img');
      img.onload = () => pose.send({ image: img });
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  
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
  
  export function drawPose(opts: any) {
    const { canvas, image, keypoints } = opts || {};
    if (!canvas || !image || !keypoints?.length) return;
  
    const w = image.clientWidth;
    const h = image.clientHeight;
  
    canvas.width = w;
    canvas.height = h;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    ctx.clearRect(0, 0, w, h);
  
    // Scale keypoints [0..1] -> pixel (chỉ dùng x,y)
    const kp = keypoints.map((pt: any) => [pt[0] * w, pt[1] * h]);
  
    const connections = [
      [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
      [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
      [11, 12], [23, 24], [11, 23], [12, 24], [23, 25], [25, 27],
      [27, 29], [29, 31], [27, 31], [24, 26], [26, 28], [28, 30],
      [30, 32], [28, 32],
    ];
  
    // Vẽ xương
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#10b981';
    connections.forEach(([i, j]) => {
      if (kp[i] && kp[j]) {
        ctx.beginPath();
        ctx.moveTo(kp[i][0], kp[i][1]);
        ctx.lineTo(kp[j][0], kp[j][1]);
        ctx.stroke();
      }
    });
  
    // Vẽ khớp
    kp.forEach(([x, y]: any) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    });
  }

const __POSE_CONNECTIONS__: number[][] = [
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  [11, 12], [23, 24], [11, 23], [12, 24], [23, 25], [25, 27],
  [27, 29], [29, 31], [27, 31], [24, 26], [26, 28], [28, 30],
  [30, 32], [28, 32],
];

export async function extractFromVideo(videoEl: HTMLVideoElement, pose?: any): Promise<any | null> {
  const p = pose || (await initPoseExtractor());
  return new Promise((resolve) => {
    try {
      p.onResults((results: any) => {
        const lm2d = results?.poseLandmarks || null;
        const lm3d = results?.poseWorldLandmarks || null;
        if (!lm2d && !lm3d) { resolve(null); return; }
        const keypoints = lm2d ? lm2d.map((pt: any) => [pt.x, pt.y]) : [];
        const poseWorldLandmarks = lm3d ? lm3d.map((pt: any) => [pt.x, pt.y, pt.z]) : [];
        resolve({ keypoints, poseWorldLandmarks, connections: __POSE_CONNECTIONS__ });
      });
      p.send({ image: videoEl });
    } catch {
      resolve(null);
    }
  });
}
