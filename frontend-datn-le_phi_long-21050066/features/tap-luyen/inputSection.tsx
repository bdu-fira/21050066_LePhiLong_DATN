'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import JointFeedback, { JointAngles } from './joinFeedBack';

declare global {
  interface Window {
    Pose: any;
  }
}

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

function euclid(a: number[], b: number[]): number {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow((a[2] || 0) - (b[2] || 0), 2)
  );
}
function angleBetween3Pts(A: number[], B: number[], C: number[]): number {
  const ab = [A[0] - B[0], A[1] - B[1], (A[2] || 0) - (B[2] || 0)];
  const cb = [C[0] - B[0], C[1] - B[1], (C[2] || 0) - (B[2] || 0)];
  const dot = ab[0] * cb[0] + ab[1] * cb[1] + ab[2] * cb[2];
  const normAb = Math.sqrt(ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2);
  const normCb = Math.sqrt(cb[0] ** 2 + cb[1] ** 2 + cb[2] ** 2);
  const cos = dot / (normAb * normCb + 1e-6);
  return Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
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
  // Các feature phụ giống code train:
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

  // Tổng cộng: 99 + 12 = 111
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
    ankleDist
  ];
  // DEBUG:
  if (features.length !== 111) {
    console.error("Số feature predict:", features.length);
  }
  const jointAngles: JointAngles = {
    leftElbow: lElbowAngle,
    rightElbow: rElbowAngle,
    leftKnee: lKneeAngle,
    rightKnee: rKneeAngle,
    leftShoulder: lShoulderAngle,
    rightShoulder: rShoulderAngle
  };
  return {
    features,
    jointAngles
  }
}


export default function InputSection() {
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

  useEffect(() => {
    let stream: MediaStream | null = null;
    let poseInstance: any = null;
    let isMounted = true;

    async function checkCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
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
      } catch (e) {
        setCameraStatus('error');
        setErrorMessage('Đã xảy ra lỗi khi kiểm tra camera!');
        return false;
      }
    }

    const loadModel = async () => {
      const modelUrl = '/models/bicep_curl_pose_model.json';
      const model = await tf.loadLayersModel(modelUrl);
      setPredictor(model);
      console.log('Nạp model thành công!');
    }

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
          minDetectionConfidence: 0.85,
          minTrackingConfidence: 0.85,
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
            results.poseLandmarks.forEach((landmark: any) => {
              const { x, y } = landmark;
              ctx.beginPath();
              ctx.arc(x * canvas.width, y * canvas.height, 5, 0, 2 * Math.PI);
              ctx.fillStyle = 'blue';
              ctx.fill();
            });
            const { jointAngles } = poseToFeatures(landmarks);
            setJointAngles(jointAngles);
          }
          ctx.restore();
        });

        const process = async () => {
          if (!videoRef.current || videoRef.current.paused) return;
          await poseInstance.send({ image: videoRef.current });
          animationRef.current = requestAnimationFrame(process);
        };

        process();
      } catch (err) {
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

  useEffect(() => {
    async function predictCurrent() {
      if (predictor && currentLandmarks && currentLandmarks.length >= 29) {
        const { features } = poseToFeatures(currentLandmarks);
        const inputTensor = tf.tensor2d([features]);
        const prediction = predictor.predict(inputTensor) as tf.Tensor;
        const arr = await prediction.data();
        const maxIdx = arr.indexOf(Math.max(...arr));
        setPredictResult(labelNames[maxIdx]);
      }
    }
    predictCurrent();
  }, [currentLandmarks, predictor]);

  return (
    <div className='relative flex flex-col gap-2'>
      {cameraStatus === 'checking' && <p className='text-center'>Đang kiểm tra camera...</p>}

      {cameraStatus === 'has_camera' && (
        <>
          <video ref={videoRef} playsInline className='w-full rounded-lg hidden' />
          <canvas ref={canvasRef} className='aspect-8/6' width={1368} height={768} />
          {predictResult && (
            <div className="absolute top-0 left-0 text-3xl font-bold text-green-600 px-4 py-2 bg-white bg-opacity-80 rounded">
              Dự đoán: {predictResult}
            </div>
          )}
          <JointFeedback angles={jointAngles} />
        </>
      )}

      {cameraStatus !== 'has_camera' && cameraStatus !== 'checking' && (
        <p className='text-center text-red-500'>{errorMessage || 'Vui lòng kiểm tra lại camera!'}</p>
      )}
    </div>
  );
}
