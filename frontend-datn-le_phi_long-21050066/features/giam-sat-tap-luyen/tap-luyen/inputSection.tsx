'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import JointFeedback, { checkShoulderRule, JointAngles } from './jointFeedBack';

declare global {
  interface Window {
    Pose: any;
  }
}

function speak(msg: string) {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utter = new window.SpeechSynthesisUtterance(msg);
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.startsWith("vi"));
    if (viVoice) utter.voice = viVoice;
    utter.lang = "vi-VN";
    window.speechSynthesis.speak(utter);
  }
}

// Hàm đợi Pose Mediapipe
function waitForPose(): Promise<any> {
  return new Promise((resolve) => {
    function check() {
      if (typeof window !== 'undefined' && window.Pose) {
        resolve(window.Pose);
      } else {
        setTimeout(check, 50);
      }
    }
    check();
  });
}

// Helper toán học
function euclid(a: number[], b: number[]): number {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow((a[2] || 0) - (b[2] || 0), 2)
  );
}
function angleBetween3Pts(A: number[], B: number[], C: number[]): number {
  // Góc tại B trong không gian 3D
  const ab = [A[0] - B[0], A[1] - B[1], (A[2] || 0) - (B[2] || 0)];
  const cb = [C[0] - B[0], C[1] - B[1], (C[2] || 0) - (B[2] || 0)];
  const dot = ab[0] * cb[0] + ab[1] * cb[1] + ab[2] * cb[2];
  const normAb = Math.sqrt(ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2);
  const normCb = Math.sqrt(cb[0] ** 2 + cb[1] ** 2 + cb[2] ** 2);
  const cos = dot / (normAb * normCb + 1e-6);
  return Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
}

// Hàm tiền xử lý và feature (chuẩn hóa đúng với model train)
function poseToFeatures(keypoints: number[][]) {
  // Center, normalize scale
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
  // Các feature phụ, giống code train
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
    lWristToShoulder, rWristToShoulder,
    lElbowAngle / 180, rElbowAngle / 180,
    lShoulderAngle / 180, rShoulderAngle / 180,
    lKneeAngle / 180, rKneeAngle / 180,
    shoulderDist, lLegLen, rLegLen, ankleDist
  ];
  if (features.length !== 111) {
    console.error("Số feature predict:", features.length);
  }

  const jointAngles: JointAngles = {
    rightShoulder: rShoulderAngle
  };
  return { features, jointAngles };
}

export type PoseState = "standing" | "mid_curl" | "full_curl" | "";

interface InputSectionProps {
  onPrediction?: (poseState: string, jointAngles: JointAngles, violate: boolean) => void;
}


export default function InputSection({ onPrediction }: any) {
  const labelNames = ["full_curl", "mid_curl", "standing"];
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const [currentLandmarks, setCurrentLandmarks] = useState<number[][] | null>(null);
  const [predictor, setPredictor] = useState<tf.LayersModel | null>(null);
  const [predictResult, setPredictResult] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'checking' | 'has_camera' | 'no_camera' | 'no_permission' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [jointAngles, setJointAngles] = useState<JointAngles | undefined>(undefined);
  const [bodyAngle, setBodyAngle] = useState<number | null>(null);

  // Setup camera & mediapipe
  useEffect(() => {
    let stream: MediaStream | null = null;
    let poseInstance: any = null;
    let isMounted = true;

    async function checkCamera() {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) {
          setCameraStatus('no_camera');
          setErrorMessage('Thiết bị không hỗ trợ camera!');
          return false;
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        if (videoInputs.length === 0) {
          setCameraStatus('no_camera');
          setErrorMessage('Không tìm thấy camera nào trên thiết bị!');
          return false;
        }
        setCameraStatus('has_camera');
        return true;
      } catch {
        setCameraStatus('error');
        setErrorMessage('Đã xảy ra lỗi khi kiểm tra camera!');
        return false;
      }
    }

    const loadModel = async () => {
      const modelUrl = '/models/bicep_curl_pose_model.json';
      const model = await tf.loadLayersModel(modelUrl);
      setPredictor(model);
    };

    const init = async () => {
      const hasCamera = await checkCamera();
      if (!hasCamera) return;

      try {
        const PoseConstructor = await waitForPose();

        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!isMounted) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        poseInstance = new PoseConstructor({
          locateFile: (file: string) => `/mediapipe/pose/${file}`,
        });

        poseInstance.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.9,
          minTrackingConfidence: 0.9,
        });

        poseInstance.onResults((results: any) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

          if (results.poseLandmarks) {
            const landmarks: number[][] = results.poseLandmarks.map((pt: any) => [pt.x, pt.y, pt.z]);
            setCurrentLandmarks(landmarks);

            // Vẽ các điểm pose lên canvas
            for (const landmark of results.poseLandmarks) {
              ctx.beginPath();
              ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 5, 0, 2 * Math.PI);
              ctx.fillStyle = 'blue';
              ctx.fill();
            }

            // Tính toán các góc cần thiết để feedback
            const { jointAngles } = poseToFeatures(landmarks);
            setJointAngles(jointAngles);
          }
          else{
            speak('Please step before the camera!')
            setPredictResult("Hãy đứng trước camera!");
          }
          ctx.restore();
        });

        const process = async () => {
          if (!videoRef.current || videoRef.current.paused) return;
          await poseInstance.send({ image: videoRef.current });
          animationRef.current = requestAnimationFrame(process);
        };

        process();
      } catch {
        setCameraStatus('error');
        setErrorMessage('Không truy cập được camera!');
      }
    };

    init();
    loadModel();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Predict và kiểm tra góc quay xéo 45° (theo Z)
  useEffect(() => {
    async function predictCurrent() {
      if (predictor && currentLandmarks && currentLandmarks.length >= 29) {
        const lShoulder = currentLandmarks[11];
        const rShoulder = currentLandmarks[12];
        const dx = rShoulder[0] - lShoulder[0];
        const dz = rShoulder[2] - lShoulder[2];
        let angleShoulderZ = Math.abs(Math.atan2(dz, dx) * 180 / Math.PI);
        setBodyAngle(angleShoulderZ);

        // Rule: chỉ nhận nếu góc này nằm trong khoảng bạn muốn
        if (angleShoulderZ < 90 || angleShoulderZ > 150) {
          speak("Please turn sideways so that your right arm is visible!");
          setPredictResult("Hãy đứng quay xéo sao cho có thể nhìn thấy tay phải!");
          // Gửi về cha trạng thái chưa hợp lệ (không predict)
          onPrediction?.("", {}, false);
          return;
        }

        // Predict nếu đúng tư thế
        const { features, jointAngles } = poseToFeatures(currentLandmarks);
        const inputTensor = tf.tensor2d([features]);
        const prediction = predictor.predict(inputTensor) as tf.Tensor;
        const arr = await prediction.data();
        const maxIdx = arr.indexOf(Math.max(...arr));
        const state = labelNames[maxIdx];
        setPredictResult(`${state} | Score: ${(arr[maxIdx] * 100).toFixed(1)}%`);
        // Check rule vi phạm khớp
        const violated = checkShoulderRule(jointAngles);
        // Gửi callback về cha
        onPrediction?.(state, jointAngles, violated);
      }
    }
    predictCurrent();
  }, [currentLandmarks, predictor]);

  return (
    <div className='relative flex flex-col gap-2'>
      {cameraStatus === 'checking' && <p className='text-center'>Đang kiểm tra camera...</p>}
      {cameraStatus === 'has_camera' && (
        <>
          {/* React camera (video) */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            className='w-full rounded-lg hidden'
          />
          {/* Kết quả pose */}
          <canvas
            ref={canvasRef}
            className='w-full'
            width={1024}
            height={768}
          />
          {/* Góc xéo thân người */}
          {bodyAngle !== null && (
            <div className="text-blue-500 text-lg">
              Góc vai (Z): {bodyAngle.toFixed(1)}°
            </div>
          )}
          {/* Dự đoán state */}
          {predictResult && (
            <div className="absolute top-0 left-0 text-3xl font-bold text-green-600 px-4 py-2 bg-white bg-opacity-80 rounded">
              {predictResult}
            </div>
          )}
          {/* Đánh giá khớp (expert system) */}
          <JointFeedback angles={jointAngles} />
        </>
      )}
      {cameraStatus !== 'has_camera' && cameraStatus !== 'checking' && (
        <p className='text-center text-red-500'>{errorMessage || 'Vui lòng kiểm tra lại camera!'}</p>
      )}
    </div>
  );
}
