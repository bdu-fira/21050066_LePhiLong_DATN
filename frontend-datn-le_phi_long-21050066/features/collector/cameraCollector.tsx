"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import JSZip from "jszip";

export default function CameraCollector({
  nShots = 10,
  intervalMs = 5000,
}) {
  const webcamRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState([]);

  // Hàm phát giọng nói
  const speak = (msg) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utter = new window.SpeechSynthesisUtterance(msg);
      // Ưu tiên tiếng Việt nếu có
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.startsWith("vi"));
      if (viVoice) utter.voice = viVoice;
      utter.lang = "vi-VN";
      window.speechSynthesis.speak(utter);
    }
  };

  async function downloadZip(imageArray) {
    const zip = new JSZip();
    imageArray.forEach((base64, idx) => {
      zip.file(`pose_${idx + 1}.jpg`, base64.split(',')[1], { base64: true });
    });
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "poses.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const startCapture = async () => {
    if (capturing) return;
    setCapturing(true);
    setProgress(0);
    const imageArray = [];
    speak(`Get in the position!`);
    await new Promise(r => setTimeout(r, 2000));
    for (let i = 0; i < nShots; i++) {
      speak(`Prepare to take picture ${i + 1}`);
      // Đợi giọng nói xong mới chụp: speechSynthesis không có callback finished tiêu chuẩn, 
      // nhưng thường chỉ mất ~1s nên có thể chờ 1s (có thể chỉnh lâu hơn hoặc ngắn hơn tuỳ tốc độ đọc).
      await new Promise(r => setTimeout(r, 1200)); // 1.2 giây cho đọc xong
      if (!webcamRef.current) break;
      const imageSrc = webcamRef.current.getScreenshot();
      imageArray.push(imageSrc);
      setProgress(i + 1);
      if (i < nShots - 1) await new Promise(r => setTimeout(r, intervalMs));
    }
    setCapturing(false);
    setImages(imageArray);
    await downloadZip(imageArray);
  };

  return (
    <div style={{ margin: "0 auto" }}>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={1024}
        videoConstraints={{ facingMode: "user" }}
        style={{ borderRadius: 10, border: "1px solid #ccc" }}
      />
      <div style={{ margin: "15px 0" }}>
        <button onClick={startCapture} disabled={capturing} style={{
          padding: "10px 24px",
          fontSize: "16px",
          background: capturing ? "#aaa" : "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: capturing ? "not-allowed" : "pointer"
        }}>
          {capturing ? "Đang chụp..." : "Bắt đầu thu thập"}
        </button>
      </div>
      <p>Tiến trình: {progress} / {nShots}</p>
    </div>
  );
}
