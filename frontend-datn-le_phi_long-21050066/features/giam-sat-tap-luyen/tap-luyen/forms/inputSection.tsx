"use client";
import React from "react";

type Props = {
  onFrame?: (videoEl: HTMLVideoElement) => Promise<any> | any;
  onDraw?: (canvasEl: HTMLCanvasElement, result: any, videoEl: HTMLVideoElement) => void;
  overlayRef?: React.Ref<HTMLCanvasElement>; // <-- chấp nhận mọi kiểu ref hợp lệ
};
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function InputSection({ onFrame, onDraw, overlayRef }: Props) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const localOverlayRef = React.useRef<HTMLCanvasElement | null>(null);

  const rafRef = React.useRef<number | null>(null);
  const startedRef = React.useRef(false);
  const streamRef = React.useRef<MediaStream | null>(null);

  // forward ref: set cả local ref và ref từ props
  const setOverlayRef = React.useCallback(
    (el: HTMLCanvasElement | null) => {
      localOverlayRef.current = el;
      if (!overlayRef) return;
      if (typeof overlayRef === "function") {
        overlayRef(el);
      } else {
        (overlayRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el;
      }
    },
    [overlayRef]
  );

  React.useEffect(() => {
    let running = true;
    const video = videoRef.current;
    if (!video) return;
    if (startedRef.current) return;
    startedRef.current = true;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        streamRef.current = stream;
        video.srcObject = stream;

        await new Promise<void>((resolve) => {
          if (video.readyState >= 2) return resolve();
          const onCanPlay = () => {
            video.removeEventListener("canplay", onCanPlay);
            resolve();
          };
          video.addEventListener("canplay", onCanPlay, { once: true });
        });

        try {
          await video.play();
        } catch {}

        const loop = async () => {
          if (!running || !video) return;

          const overlay = localOverlayRef.current;
          const vw = video.videoWidth;
          const vh = video.videoHeight;

          if (overlay && vw && vh) {
            if (overlay.width !== vw) overlay.width = vw;
            if (overlay.height !== vh) overlay.height = vh;
          }

          let result: any = undefined;
          if (typeof onFrame === "function") {
            result = await onFrame(video);
          }

          if (overlay && typeof onDraw === "function") {
            const ctx = overlay.getContext("2d");
            if (ctx) ctx.clearRect(0, 0, overlay.width, overlay.height);
            onDraw(overlay, result, video);
          }

          await sleep(40); // "ngủ" 0.1s

          rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

      } catch {}
    };

    start();

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const s = streamRef.current;
      if (s) {
        s.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (video) video.srcObject = null;
      startedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // không đưa onFrame/onDraw vào deps để tránh re-init stream

  return (
    <div className="col-span-3 relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        playsInline
        muted
        className="w-full h-full object-cover rounded-xl"
        onClick={() => videoRef.current?.play().catch(() => {})}
      />
      <canvas
        ref={setOverlayRef}  // <-- forward ref + dùng localOverlayRef cho nội bộ
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
