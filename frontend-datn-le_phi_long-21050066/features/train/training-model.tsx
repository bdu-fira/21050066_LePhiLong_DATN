"use client";
import React, { useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";

// Hàm tính khoảng cách Euclid giữa hai điểm [x,y,z]
function euclid(a, b) {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow((a[2] || 0) - (b[2] || 0), 2)
  );
}

// Hàm tính góc (degree) giữa 3 điểm (joint angle)
function angleBetween3Pts(A, B, C) {
  // Góc ở B
  const ab = [A[0] - B[0], A[1] - B[1], (A[2] || 0) - (B[2] || 0)];
  const cb = [C[0] - B[0], C[1] - B[1], (C[2] || 0) - (B[2] || 0)];
  const dot = ab[0]*cb[0] + ab[1]*cb[1] + ab[2]*cb[2];
  const normAb = Math.sqrt(ab[0]**2 + ab[1]**2 + ab[2]**2);
  const normCb = Math.sqrt(cb[0]**2 + cb[1]**2 + cb[2]**2);
  const cos = dot / (normAb * normCb + 1e-6);
  return Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
}

// Hàm tiền xử lý + tạo feature
function poseToFeatures(keypoints) {
  // 0-32 là mediapipe pose keypoints (x, y, z)
  // 11: left_shoulder, 12: right_shoulder, 23: left_hip, 24: right_hip, 13: left_elbow, 14: right_elbow, 15: left_wrist, 16: right_wrist, 25: left_knee, 26: right_knee, 27: left_ankle, 28: right_ankle

  // Center body (mid_hip)
  const midHip = [
    (keypoints[23][0] + keypoints[24][0]) / 2,
    (keypoints[23][1] + keypoints[24][1]) / 2,
    (keypoints[23][2] + keypoints[24][2]) / 2,
  ];
  // Center shoulder
  const midShoulder = [
    (keypoints[11][0] + keypoints[12][0]) / 2,
    (keypoints[11][1] + keypoints[12][1]) / 2,
    (keypoints[11][2] + keypoints[12][2]) / 2,
  ];
  // Chuẩn hóa: lấy chiều cao là khoảng cách từ midShoulder đến midHip + từ midHip đến trung điểm 2 mắt cá
  const midAnkle = [
    (keypoints[27][0] + keypoints[28][0]) / 2,
    (keypoints[27][1] + keypoints[28][1]) / 2,
    (keypoints[27][2] + keypoints[28][2]) / 2,
  ];
  const bodyHeight = euclid(midShoulder, midHip) + euclid(midHip, midAnkle) + 1e-6;

  // Đưa về giữa (center) midHip, scale theo bodyHeight
  const normed = keypoints.map(([x, y, z]) => [
    (x - midHip[0]) / bodyHeight,
    (y - midHip[1]) / bodyHeight,
    (z - midHip[2]) / bodyHeight,
  ]);

  // Gói về 0-1 nếu muốn (optional, thường đã đủ ổn)
  // Nếu muốn scale về (0,1), tính min/max toàn bộ rồi scale
  // const xs = normed.map(pt => pt[0]);
  // const ys = normed.map(pt => pt[1]);
  // const zs = normed.map(pt => pt[2]);
  // const minX = Math.min(...xs), maxX = Math.max(...xs);
  // const minY = Math.min(...ys), maxY = Math.max(...ys);
  // const minZ = Math.min(...zs), maxZ = Math.max(...zs);
  // const normed01 = normed.map(([x, y, z]) => [
  //   (x-minX)/(maxX-minX+1e-6),
  //   (y-minY)/(maxY-minY+1e-6),
  //   (z-minZ)/(maxZ-minZ+1e-6),
  // ]);

  // Các features bổ sung:
  // 1. Khoảng cách tay-trái, tay-phải đến vai giữa (bình thường hóa theo bodyHeight)
  const lWristToShoulder = euclid(normed[15], normed[11]);
  const rWristToShoulder = euclid(normed[16], normed[12]);
  // 2. Góc khuỷu tay
  const lElbowAngle = angleBetween3Pts(normed[11], normed[13], normed[15]);
  const rElbowAngle = angleBetween3Pts(normed[12], normed[14], normed[16]);
  // 3. Góc vai (giữa cổ-tay-hông)
  const lShoulderAngle = angleBetween3Pts(normed[13], normed[11], normed[23]);
  const rShoulderAngle = angleBetween3Pts(normed[14], normed[12], normed[24]);
  // 4. Góc đầu gối
  const lKneeAngle = angleBetween3Pts(normed[23], normed[25], normed[27]);
  const rKneeAngle = angleBetween3Pts(normed[24], normed[26], normed[28]);
  // 5. Chiều dài vai (bình thường hóa)
  const shoulderDist = euclid(normed[11], normed[12]);
  // 6. Chiều dài chân (hông đến mắt cá)
  const lLegLen = euclid(normed[23], normed[27]);
  const rLegLen = euclid(normed[24], normed[28]);
  // 7. Khoảng cách 2 mắt cá
  const ankleDist = euclid(normed[27], normed[28]);
  
  // Đóng gói feature vector:
  const features = [
    ...normed.flat(), // Toàn bộ [x,y,z] đã chuẩn hóa của 33 điểm (99 giá trị)
    lWristToShoulder,
    rWristToShoulder,
    lElbowAngle/180, // scale về 0-1
    rElbowAngle/180,
    lShoulderAngle/180,
    rShoulderAngle/180,
    lKneeAngle/180,
    rKneeAngle/180,
    shoulderDist,
    lLegLen,
    rLegLen,
    ankleDist,
  ];
  return features;
}

// Chuẩn hóa: đưa khung xương về vai giữa, chia cho độ dài vai
function normalizeKeypointsByShoulder(keypoints: number[][]): number[][] {
  const lShoulder = keypoints[11];
  const rShoulder = keypoints[12];
  const centerX = (lShoulder[0] + rShoulder[0]) / 2;
  const centerY = (lShoulder[1] + rShoulder[1]) / 2;
  const shoulderDist = Math.sqrt(
    Math.pow(lShoulder[0] - rShoulder[0], 2) +
      Math.pow(lShoulder[1] - rShoulder[1], 2)
  );
  const scale = 1 / Math.max(shoulderDist, 1e-6);
  return keypoints.map(([x, y, z]) => [
    (x - centerX) * scale,
    (y - centerY) * scale,
    z * scale,
  ]);
}

function rotateKeypoints(keypoints: number[][], thetaDeg: number): number[][] {
  const theta = (thetaDeg * Math.PI) / 180;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  return keypoints.map(([x, y, z]) => [
    x * cosT - y * sinT,
    x * sinT + y * cosT,
    z,
  ]);
}

function scaleKeypoints(keypoints: number[][], scale = 1): number[][] {
  return keypoints.map(([x, y, z]) => [x * scale, y * scale, z * scale]);
}

function flipKeypointsHorizontally(keypoints: number[][]): number[][] {
  return keypoints.map(([x, y, z]) => [-x, y, z]);
}

function dropoutKeypoints(keypoints: number[][], dropProb = 0.1): number[][] {
  return keypoints.map(([x, y, z]) =>
    Math.random() < dropProb ? [0, 0, 0] : [x, y, z]
  );
}

function jitterKeypoints(keypoints: number[][], sigma = 0.01): number[][] {
  return keypoints.map(([x, y, z]) => [
    x + (Math.random() - 0.5) * sigma,
    y + (Math.random() - 0.5) * sigma,
    z + (Math.random() - 0.5) * sigma * 0.5,
  ]);
}

// Flatten [33][3] => [99]
function flattenKeypoints(kp: number[][]) {
  return kp.flat();
}

// Hàm tổng hợp augment cho 1 mẫu
function augmentKeypointsFull(keypoints: number[][]): number[][][] {
  const norm = normalizeKeypointsByShoulder(keypoints);
  const result: number[][][] = [norm];

  // Xoay nhiều góc
  const angles = [-20, -10, 10, 20];
  angles.forEach((angle) => {
    result.push(rotateKeypoints(norm, angle));
  });

  // Scale xa/gần nhẹ
  [0.9, 1.1].forEach((scaleVal) => {
    result.push(scaleKeypoints(norm, scaleVal));
  });

  // Flip ngang
  result.push(flipKeypointsHorizontally(norm));

  // Dropout (random một vài keypoint)
  result.push(dropoutKeypoints(norm, 0.12));

  // Thêm jitter nhẹ (noise)
  result.push(jitterKeypoints(norm, 0.01));

  return result;
}

const fileLabels = [
  { fileName: "full_curl.json", key: "full_curl" },
  { fileName: "mid_curl.json", key: "mid_curl" },
  { fileName: "standing.json", key: "standing" }
];

export default function TrainBicepCurl() {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [mapping, setMapping] = useState<string[]>([]);
  const [trained, setTrained] = useState(false);
  const modelRef = useRef<tf.LayersModel | null>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length < 3) {
      setStatus("Chọn đủ cả 3 file: full_curl.json, mid_curl.json, standing.json!");
      return;
    }
    setStatus("Đang đọc dữ liệu...");
    let allData: number[][] = [];
    let allLabels: number[] = [];
    let labelNames: string[] = [];
    for (let idx = 0; idx < fileLabels.length; idx++) {
      const { fileName, key } = fileLabels[idx];
      const file = Array.from(files).find(f => f.name === fileName);
      if (!file) {
        setStatus(`Thiếu file: ${fileName}`);
        return;
      }
      const text = await file.text();
      const obj = JSON.parse(text);
      let arr: number[][][] = [];
      if (Array.isArray(obj)) {
        arr = obj;
      } else if (typeof obj === "object" && obj !== null) {
        arr = obj[key] ?? Object.values(obj)[0];
      }
      if (!arr || !Array.isArray(arr) || arr.length === 0) {
        setStatus(`File ${fileName} không chứa data hợp lệ!`);
        return;
      }
      for (const kp of arr) {
        const augKps = augmentKeypointsFull(kp); // <--- augment
        for (const aug of augKps) {
          allData.push(poseToFeatures(aug)); // Dùng feature mới
          allLabels.push(idx);
        }
      }
      
      labelNames.push(key);
    }
    setMapping(labelNames);

    // Tạo tensor
    const X = tf.tensor2d(allData); // [num_samples, 99]
    const y = tf.oneHot(tf.tensor1d(allLabels, "int32"), 3); // [num_samples, 3]

    setStatus("Bắt đầu huấn luyện...");
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [allData[0].length], units: 64, activation: "relu" }));
    model.add(tf.layers.dense({ units: 32, activation: "relu" }));
    model.add(tf.layers.dense({ units: 3, activation: "softmax" }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"]
    });

    await model.fit(X, y, {
      epochs: 50,
      batchSize: 8,
      validationSplit: 0.3,
    
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          setMessage(
            `Epoch ${epoch + 1}: loss=${logs?.loss?.toFixed(4)}, val_loss=${logs?.loss?.toFixed(4)}, acc=${(logs?.accuracy ?? logs?.acc)?.toFixed(4)}, val_acc=${(logs?.val_accuracy ?? logs?.val_acc)?.toFixed(4)}`
          )
          setStatus('Đang huấn luyện');
        }
      }
    });

    setStatus("Huấn luyện xong! Bạn có thể export model.");
    modelRef.current = model;
    setTrained(true);
  };

  // Xuất model
  const handleExport = async () => {
    if (!modelRef.current) return;
    setStatus("Đang xuất model...");
    await modelRef.current.save("downloads://bicep_curl_pose_model");
    setStatus("Đã lưu model (2 file .json + .bin) về máy!");
  };

  return (
    <div>
      <h3>Train Bicep Curl Pose Model (TFJS + Augment chuẩn hóa & nâng cao)</h3>
      <p>Chọn đủ cả 3 file: full_curl.json, mid_curl.json, standing.json</p>
      <input type="file" multiple accept="application/json" onChange={handleFiles} />
      <p>
        {message}
      </p>
      <div style={{ margin: "12px 0", fontFamily: "monospace" }}>{status}</div>
      {mapping.length > 0 && (
        <div>
          <b>Label mapping:</b>
          <ul>
            {mapping.map((lbl, idx) => (
              <li key={lbl}>{idx}: {lbl}</li>
            ))}
          </ul>
        </div>
      )}
      {trained && (
        <button onClick={handleExport}>Export model (.json & .bin)</button>
      )}
    </div>
  );
}
