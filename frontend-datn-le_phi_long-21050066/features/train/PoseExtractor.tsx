"use client";
import React, { useRef, useState } from "react";

declare global {
  interface Window {
    Pose: any;
  }
}

interface PoseData {
  file: string;
  label: string;
  keypoints: number[][];
}

const BatchPoseExtractor: React.FC = () => {
  const [poseResults, setPoseResults] = useState<PoseData[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // Hàm nạp mediapipe/pose.js đúng chuẩn
  const loadMediaPipeScript = async () => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window.Pose === "function") return resolve();
      const script = document.createElement("script");
      script.src = "/mediapipe/pose.js";
      script.async = true;
      script.onload = () => {
        if (typeof window.Pose === "function") resolve();
        else reject("Không thể load Pose WASM! Sai file pose.js?");
      };
      script.onerror = () => reject("Không thể load mediapipe/pose.js!");
      document.body.appendChild(script);
    });
  };

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    setProcessing(true);
    setPoseResults([]);
    setError("");

    try {
      await loadMediaPipeScript();
    } catch (e) {
      setError(String(e));
      setProcessing(false);
      return;
    }

    if (typeof window.Pose !== "function") {
      setError("Không thể khởi tạo Pose. Hãy kiểm tra lại pose.js.");
      setProcessing(false);
      return;
    }

    // Khởi tạo Pose instance
    const pose = new window.Pose({
      locateFile: (file: string) => `/mediapipe/pose/${file}`,
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.8,
    });

    // Dùng queue để chờ trả kết quả đúng
    const resultQueue: Array<(r: any) => void> = [];
    pose.onResults((results: any) => {
      const resolver = resultQueue.shift();
      if (resolver) resolver(results);
    });

    const resultsArr: PoseData[] = [];

    for (let i = 0; i < files.length; i++) {
      setCurrent(i + 1);
      const file = files[i];
      const label = file.webkitRelativePath
        ? file.webkitRelativePath.split("/")[0]
        : file.name.split("/")[0];
      const img = imgRef.current!;
      img.dataset.label = label;
      img.src = URL.createObjectURL(file);
      await new Promise((res) => (img.onload = res));

      // Gửi ảnh cho Pose và chờ trả kết quả
      const results = await new Promise<any>((resolve) => {
        resultQueue.push(resolve);
        pose.send({ image: img });
      });

      // Debug: in kết quả trả về
      // console.log("results:", results);

      if (results?.poseLandmarks) {
        resultsArr.push({
          file: file.name,
          label: label,
          keypoints: results.poseLandmarks.map((lm: any) => [lm.x, lm.y, lm.z]),
        });
      }
    }
    
    
    // Sau khi xử lý xong tất cả các ảnh:
    setPoseResults(resultsArr);
    setProcessing(false);

    if (resultsArr.length > 0) {
        // Gom dữ liệu theo label: chỉ lấy mảng keypoints cho mỗi nhãn
        const grouped: Record<string, number[][][]> = {};
        for (const item of resultsArr) {
          if (!grouped[item.label]) grouped[item.label] = [];
          grouped[item.label].push(item.keypoints);
        }
        const json = JSON.stringify(grouped, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "grouped_pose_keypoints.json";
        link.click();
      } else {
        setError("Không ảnh nào nhận diện được pose. Xem lại file ảnh!");
      }
      
  };

  return (
    <div>
      <h3>Batch Pose Extractor (MediaPipe WASM, chọn thư mục động tác)</h3>
      <input
        type="file"
        webkitdirectory="true"
        directory=""
        multiple
        accept="image/*"
        onChange={handleFiles}
        style={{ marginBottom: 10 }}
      />
      <img ref={imgRef} alt="" style={{ display: "none" }} />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        {processing ? (
          <p>
            Đang xử lý... Ảnh {current} / {typeof window !== "undefined" ? (window as any)?.lastFilesCount || "?" : "?"}
          </p>
        ) : (
          <p>
            Đã xử lý: {poseResults.length} ảnh. Xuất file JSON: all_pose_keypoints.json
          </p>
        )}
      </div>
      <pre style={{ maxHeight: 300, overflow: "auto", background: "#eee" }}>
        {JSON.stringify(poseResults.slice(0, 5), null, 2)}
        {"\n"}... (Hiển thị 5 kết quả đầu)
      </pre>
    </div>
  );
};

export default BatchPoseExtractor;
