'use client';

import React, { useEffect, useRef, useState } from 'react';

/** =============== CẤU HÌNH DỄ SỬA =============== */
// Tên bài tập (gửi kèm lên server)
const EXERCISE_NAME = 'airsquat';

// Danh sách label — chọn 1 label mỗi lần chụp
const LABELS = ['Label 1', 'Label 2', 'Label 3'];

// Số ảnh tối đa cho 1 label
const MAX_PHOTOS_PER_LABEL = 35;

// Chu kỳ chụp (ms): mỗi X ms sẽ nói + chụp 1 ảnh
const CAPTURE_INTERVAL_MS = 3000;

// Thời gian “nhắc chuẩn bị” trước khi chụp (ms). Nên <= CAPTURE_INTERVAL_MS
const PREPARE_LEAD_MS = 1000;

// Lật gương khi lưu (thường tiện cho camera trước)
const MIRROR_WHEN_SAVING = true;

// Giảm kích thước & nén JPEG để tránh 413
const MAX_WIDTH = 960;
const MAX_HEIGHT = 540;
const JPEG_QUALITY = 0.7;

// Ưu tiên camera trước
const VIDEO_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: { ideal: 'user' },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  audio: false,
};
/** ================================================ */

export default function Page() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const preTimerRef = useRef<number | null>(null);
  const postTimerRef = useRef<number | null>(null);
  const startCamLock = useRef(false);

  // Wake Lock
  const wakeLockRef = useRef<any>(null);
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && isRunningRef.current) {
      requestWakeLock();
    }
  };
  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator && !wakeLockRef.current) {
        const sentinel = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current = sentinel;
        sentinel.addEventListener('release', () => {
          if (isRunningRef.current && document.visibilityState === 'visible') {
            requestWakeLock();
          }
        });
        document.addEventListener('visibilitychange', handleVisibilityChange);
      }
    } catch (err) {
      console.warn('WakeLock request failed:', err);
    }
  }
  async function releaseWakeLock() {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    try { await wakeLockRef.current?.release(); } catch {}
    wakeLockRef.current = null;
  }

  const [selectedLabel, setSelectedLabel] = useState<string>(LABELS[0]);
  const selectedLabelRef = useRef<string>(LABELS[0]);

  const [isRunning, _setIsRunning] = useState(false);
  const isRunningRef = useRef(false);

  const [count, _setCount] = useState(0);
  const countRef = useRef(0);

  const [status, setStatus] = useState('');
  const [images, _setImages] = useState<string[]>([]); // preview cho UI

  // helpers sync state & ref
  const setIsRunning = (v: boolean) => { isRunningRef.current = v; _setIsRunning(v); };
  const setCount = (v: number) => { countRef.current = v; _setCount(v); };
  const setImages = (updater: (prev: string[]) => string[]) => {
    _setImages(prev => updater(prev));
  };
  const setSel = (v: string) => { selectedLabelRef.current = v; setSelectedLabel(v); };

  /** khởi động camera khi vào trang */
  useEffect(() => {
    startCamera();
    return () => {
      clearTimers();
      releaseWakeLock();
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    if (startCamLock.current) return;
    startCamLock.current = true;
    try {
      if (streamRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS);
      streamRef.current = stream;

      const video = videoRef.current!;
      video.muted = true;
      video.setAttribute('playsInline', 'true');
      (video as any).srcObject = stream;

      await new Promise<void>((resolve) => {
        const ready = () => {
          video.removeEventListener('loadedmetadata', ready);
          video.removeEventListener('canplay', ready);
          resolve();
        };
        if (video.readyState >= 2) resolve();
        else {
          video.addEventListener('loadedmetadata', ready, { once: true });
          video.addEventListener('canplay', ready, { once: true });
        }
      });

      try { await video.play(); }
      catch (err: any) {
        if (err?.name !== 'AbortError') console.warn('video.play() failed:', err);
      }
    } catch (err: any) {
      console.error(err);
      setStatus('Không truy cập được camera: ' + (err?.message ?? String(err)));
    } finally {
      startCamLock.current = false;
    }
  }

  function stopCamera() {
    const video = videoRef.current;
    if (video) {
      try { video.pause(); } catch {}
      (video as any).srcObject = null;
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }

  function clearTimers() {
    if (preTimerRef.current) { window.clearTimeout(preTimerRef.current); preTimerRef.current = null; }
    if (postTimerRef.current) { window.clearTimeout(postTimerRef.current); postTimerRef.current = null; }
  }

  function resetForRun() {
    setImages(() => []);
    setCount(0);
    setStatus('');
  }

  async function startSession() {
    if (!videoRef.current) return;
    if (CAPTURE_INTERVAL_MS < PREPARE_LEAD_MS) {
      setStatus('CAPTURE_INTERVAL_MS phải >= PREPARE_LEAD_MS'); return;
    }
    resetForRun();
    setIsRunning(true);

    await requestWakeLock();

    if (videoRef.current.videoWidth === 0) {
      await new Promise<void>(res =>
        videoRef.current!.addEventListener('loadedmetadata', () => res(), { once: true })
      );
    }
    runLoop();
  }

  function stopSession() {
    setIsRunning(false);
    clearTimers();
    releaseWakeLock();
    setStatus('Đã dừng.');
  }

  function speak(text: string) {
    try {
      if ('speechSynthesis' in window) {
        const uttr = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(uttr);
      }
    } catch {/* noop */}
  }

  // Chụp ảnh → trả về Blob để upload + DataURL preview cho UI
  async function captureFrameBlobAndPreview(): Promise<{ blob: Blob; previewUrl: string; ext: 'jpg' }> {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    const vw = video.videoWidth, vh = video.videoHeight;
    const ratio = Math.min(MAX_WIDTH / vw, MAX_HEIGHT / vh, 1);
    const w = Math.round(vw * ratio);
    const h = Math.round(vh * ratio);

    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.save();
    if (MIRROR_WHEN_SAVING) { ctx.scale(-1, 1); ctx.drawImage(video, -w, 0, w, h); }
    else { ctx.drawImage(video, 0, 0, w, h); }
    ctx.restore();

    const previewUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', JPEG_QUALITY)
    );
    return { blob, previewUrl, ext: 'jpg' };
  }

  // Upload 1 ảnh bằng FormData (tránh 413)
  async function uploadShot(index: number, file: Blob, ext: 'jpg' | 'png'): Promise<boolean> {
    try {
      const form = new FormData();
      form.append('exerciseName', EXERCISE_NAME);
      form.append('label', selectedLabelRef.current);
      form.append('index', String(index));
      form.append('file', file, `img_${index}.${ext}`);

      const res = await fetch('/api/save-images', {
        method: 'POST',
        body: form,
        keepalive: true,
      });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        setStatus(`Upload ảnh ${index} lỗi: ${res.status} ${t}`);
        console.error('Upload ảnh lỗi:', res.status, t);
        return false;
      }
      return true;
    } catch (e: any) {
      setStatus(`Upload ảnh ${index} lỗi: ${e?.message ?? e}`);
      console.error('Upload shot failed:', e);
      return false;
    }
  }

  function runLoop() {
    if (!isRunningRef.current) return;

    const nextIndex = countRef.current + 1;
    setStatus(`Label: ${selectedLabelRef.current} — chuẩn bị... (${nextIndex}/${MAX_PHOTOS_PER_LABEL})`);

    speak('prepare for the next photo');

    preTimerRef.current = window.setTimeout(async () => {
      if (!isRunningRef.current) return;

      const { blob, previewUrl, ext } = await captureFrameBlobAndPreview();
      setImages(prev => [...prev, previewUrl]);

      const newCount = countRef.current + 1;
      setCount(newCount);
      setStatus(`Đã chụp ${newCount}/${MAX_PHOTOS_PER_LABEL} cho ${selectedLabelRef.current}`);

      const ok = await uploadShot(newCount, blob, ext);
      if (!ok) {
        setStatus(`Upload ảnh ${newCount} thất bại. Dừng phiên.`);
        stopSession();
        return;
      }

      if (newCount >= MAX_PHOTOS_PER_LABEL) {
        finishSession();
        return;
      }

      const remaining = Math.max(0, CAPTURE_INTERVAL_MS - PREPARE_LEAD_MS);
      postTimerRef.current = window.setTimeout(runLoop, remaining);
    }, PREPARE_LEAD_MS) as unknown as number;
  }

  function finishSession() {
    setIsRunning(false);
    clearTimers();
    releaseWakeLock();
    setStatus(`Xong label "${selectedLabelRef.current}". Ảnh đã được lưu từng tấm.`);
  }

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <h1>Thu thập ảnh cho 1 label</h1>

      <div style={{ display: 'grid', gap: 12 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            maxHeight: 480,
            background: '#000',
            borderRadius: 8,
            objectFit: 'cover',
          }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label>
            Chọn label:&nbsp;
            <select
              value={selectedLabel}
              onChange={e => setSel(e.target.value)}
              disabled={isRunning}
            >
              {LABELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>

          <button onClick={startSession} disabled={isRunning} style={{ padding: '8px 12px', borderRadius: 8 }}>
            Bắt đầu
          </button>
          <button onClick={stopSession} disabled={!isRunning} style={{ padding: '8px 12px', borderRadius: 8 }}>
            Dừng
          </button>
        </div>

        <div style={{ fontSize: 14, color: '#555' }}>
          <div><strong>Bài tập:</strong> {EXERCISE_NAME}</div>
          <div><strong>Label hiện tại:</strong> {selectedLabel}</div>
          <div><strong>Đã chụp:</strong> {count}/{MAX_PHOTOS_PER_LABEL}</div>
          <div><strong>Trạng thái:</strong> {status}</div>
        </div>

        {/* xem nhanh ảnh đã chụp */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {images.slice(-8).map((src, i) => (
            <img key={i} src={src} alt={`preview ${i}`}
                 style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 6 }} />
          ))}
        </div>
      </div>
    </main>
  );
}
