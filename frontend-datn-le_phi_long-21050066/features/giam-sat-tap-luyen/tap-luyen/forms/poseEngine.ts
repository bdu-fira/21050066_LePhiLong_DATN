// Thuần TS: tải MediaPipe Pose + TF.js model và xử lý frame
import * as tf from "@tensorflow/tfjs";
import { JointAngles } from "./jointFeedBack";

declare global {
  interface Window {
    Pose: any;
  }
}

export type PoseState = "standing" | "mid_curl" | "full_curl" | "";
const LABELS: PoseState[] = ["full_curl", "mid_curl", "standing"]; // theo model hiện có

function waitForPose(): Promise<any> {
  return new Promise((resolve) => {
    const check = () =>
      typeof window !== "undefined" && (window as any).Pose
        ? resolve((window as any).Pose)
        : setTimeout(check, 50);
    check();
  });
}

function euclid(a: number[], b: number[]): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 +
      (a[1] - b[1]) ** 2 +
      (((a[2] || 0) - (b[2] || 0)) ** 2)
  );
}
function angleBetween3Pts(A: number[], B: number[], C: number[]): number {
  const ab = [A[0] - B[0], A[1] - B[1], (A[2] || 0) - (B[2] || 0)];
  const cb = [C[0] - B[0], C[1] - B[1], (C[2] || 0) - (B[2] || 0)];
  const dot = ab[0] * cb[0] + ab[1] * cb[1] + ab[2] * cb[2];
  const nab = Math.sqrt(ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2);
  const ncb = Math.sqrt(cb[0] ** 2 + cb[1] ** 2 + cb[2] ** 2);
  const cos = dot / (nab * ncb + 1e-6);
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

function poseToFeatures(keypoints: number[][]) {
  const midHip = [
    (keypoints[23][0] + keypoints[24][0]) / 2,
    (keypoints[23][1] + keypoints[24][1]) / 2,
    (keypoints[23][2] + keypoints[24][2]) / 2,
  ];
  const midShoulder = [
    (keypoints[11][0] + keypoints[12][0]) / 2,
    (keypoints[11][1] + keypoints[12][1]) / 2,
    (keypoints[11][2] + keypoints[12][2]) / 2,
  ];
  const midAnkle = [
    (keypoints[27][0] + keypoints[28][0]) / 2,
    (keypoints[27][1] + keypoints[28][1]) / 2,
    (keypoints[27][2] + keypoints[28][2]) / 2,
  ];
  const bodyHeight = euclid(midShoulder, midHip) + euclid(midHip, midAnkle) + 1e-6;

  const normed = keypoints.map(([x, y, z]) => [
    (x - midHip[0]) / bodyHeight,
    (y - midHip[1]) / bodyHeight,
    (z - midHip[2]) / bodyHeight,
  ]);

  const lWristToShoulder = euclid(normed[15], normed[11]);
  const rWristToShoulder = euclid(normed[16], normed[12]);
  const lElbowAngle = angleBetween3Pts(normed[11], normed[13], normed[15]);
  const rElbowAngle = angleBetween3Pts(normed[12], normed[14], normed[16]);
  const lShoulderAngle = angleBetween3Pts(normed[13], normed[11], normed[23]);
  const rShoulderAngle = angleBetween3Pts(normed[14], normed[12], normed[24]);
  const lKneeAngle = angleBetween3Pts(normed[23], normed[25], normed[27]);
  const rKneeAngle = angleBetween3Pts(normed[24], normed[26], normed[28]);
  const shoulderDist = euclid(normed[11], normed[12]);
  const lLegLen = euclid(normed[23], normed[27]);
  const rLegLen = euclid(normed[24], normed[28]);
  const ankleDist = euclid(normed[27], normed[28]);

  const features = [
    ...normed.flat(),
    lWristToShoulder,
    rWristToShoulder,
    lElbowAngle / 180,
    rElbowAngle / 180,
    lShoulderAngle / 180,
    rShoulderAngle / 180,
    lKneeAngle / 180,
    rKneeAngle / 180,
    shoulderDist,
    lLegLen,
    rLegLen,
    ankleDist,
  ];

  const jointAngles: JointAngles = { rightShoulder: rShoulderAngle };
  return { features, jointAngles };
}

export type InferenceResult = {
  state: PoseState;
  score: number;
  landmarks: number[][] | null;
  jointAngles?: JointAngles;
};

export class PoseEngine {
  private pose: any | null = null;
  private model: tf.LayersModel | null = null;
  private waiters: ((r: any) => void)[] = [];
  private lastResult: any = null;

  constructor(
    private opts: {
      modelUrl: string;                 // "/models/bicep_curl_pose_model.json"
      mediapipeBasePath?: string;       // "/mediapipe/pose"
    }
  ) {}

  async init() {
    const PoseCtor = await waitForPose();
    this.pose = new PoseCtor({
      locateFile: (file: string) =>
        `${this.opts.mediapipeBasePath || "/mediapipe/pose"}/${file}`,
    });
    this.pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.9,
      minTrackingConfidence: 0.9,
    });
    this.pose.onResults((r: any) => {
      this.lastResult = r;
      this.waiters.forEach((w) => w(r));
      this.waiters = [];
    });

    this.model = await tf.loadLayersModel(this.opts.modelUrl);
  }

  private onNextResults(): Promise<any> {
    return new Promise((resolve) => {
      if (this.lastResult) return resolve(this.lastResult);
      this.waiters.push(resolve);
    });
  }

  async processFrame(
    image: HTMLVideoElement | HTMLCanvasElement | ImageBitmap
  ): Promise<InferenceResult> {
    if (!this.pose || !this.model) return { state: "", score: 0, landmarks: null };

    await this.pose.send({ image });
    const r = await this.onNextResults();

    if (!r?.poseLandmarks) return { state: "", score: 0, landmarks: null };

    const landmarks: number[][] = r.poseLandmarks.map((p: any) => [p.x, p.y, p.z]);
    const { features, jointAngles } = poseToFeatures(landmarks);

    const { state, score } = tf.tidy(() => {
      const x = tf.tensor2d([features]);
      const logits = this.model!.predict(x) as tf.Tensor;
      const arr = logits.dataSync();
      let maxI = 0;
      for (let i = 1; i < arr.length; i++) if (arr[i] > arr[maxI]) maxI = i;
      return { state: LABELS[maxI], score: arr[maxI] as number };
    });

    return { state, score, landmarks, jointAngles };
  }

  drawOverlay(canvas: HTMLCanvasElement | null | undefined, result: InferenceResult) {
    if (!canvas || !result?.landmarks) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width: W, height: H } = canvas;

    ctx.save();
    ctx.clearRect(0, 0, W, H);
    for (const [x, y] of result.landmarks) {
      ctx.beginPath();
      ctx.arc(x * W, y * H, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#22c55e";
      ctx.fill();
    }
    ctx.restore();
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.pose = null;
    this.waiters = [];
    this.lastResult = null;
  }
}
