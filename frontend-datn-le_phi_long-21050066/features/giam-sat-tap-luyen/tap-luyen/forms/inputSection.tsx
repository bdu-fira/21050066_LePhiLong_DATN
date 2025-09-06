"use client";
import React from "react";

type Props = {
  onFrame?: (videoEl: HTMLVideoElement) => Promise<any> | any;
  onDraw?: (canvasEl: HTMLCanvasElement, result: any, videoEl: HTMLVideoElement) => void;
  overlayRef?: React.Ref<HTMLCanvasElement>;
};
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function InputSection({ onFrame, onDraw, overlayRef }: Props) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const localOverlayRef = React.useRef<HTMLCanvasElement | null>(null);

  const rafRef = React.useRef<number | null>(null);
  const startedRef = React.useRef(false);
  const streamRef = React.useRef<MediaStream | null>(null);

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
          video: {
            facingMode: { ideal: "user" },
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 360 },
            frameRate: { ideal: 60, min: 30 },
          },
          audio: false,
        });

        streamRef.current = stream;
        video.srcObject = stream;

        try {
          const track = stream.getVideoTracks()[0];
          const caps: any = track.getCapabilities ? (track.getCapabilities() as any) : {};
          const settings: any = track.getSettings ? (track.getSettings() as any) : {};

          const advanced: Record<string, any>[] = [];
          if (caps.focusMode && Array.isArray(caps.focusMode) && caps.focusMode.includes("continuous")) {
            advanced.push({ focusMode: "continuous" });
          }
          if (caps.exposureMode && Array.isArray(caps.exposureMode) && caps.exposureMode.includes("continuous")) {
            advanced.push({ exposureMode: "continuous" });
          }
          if (caps.whiteBalanceMode && Array.isArray(caps.whiteBalanceMode) && caps.whiteBalanceMode.includes("continuous")) {
            advanced.push({ whiteBalanceMode: "continuous" });
          }

          if (caps.iso && typeof caps.iso.max === 'number') {
            const desiredIso = Math.min(caps.iso.max, 1200);
            advanced.push({ iso: desiredIso });
          }
          if (caps.exposureCompensation && typeof caps.exposureCompensation.max === 'number') {
            const currentExpComp = settings.exposureCompensation || 0;
            const desiredExpComp = Math.min(caps.exposureCompensation.max, currentExpComp + 1.5);
            advanced.push({ exposureCompensation: desiredExpComp });
          }
          // ========================================================

          if (advanced.length > 0 && typeof (track as any).applyConstraints === "function") {
            await (track as any).applyConstraints({ advanced } as any);
          }
        } catch {
        }

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

            const ctx = overlay.getContext("2d");
            if (ctx && "imageSmoothingEnabled" in ctx) {
              (ctx as CanvasRenderingContext2D).imageSmoothingEnabled = false;
            }
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

          await sleep(20);
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
  }, []);

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
        ref={setOverlayRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}