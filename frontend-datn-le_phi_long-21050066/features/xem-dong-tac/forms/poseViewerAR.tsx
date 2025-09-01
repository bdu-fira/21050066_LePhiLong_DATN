"use client";

import React from "react";
import Script from "next/script";

type Props = {
  /** Blob/URL GLB/GLTF (AR ưu tiên GLB/GLTF). Nếu không có, sẽ render placeholder. */
  src?: string | null;
  /** 'hiro' mặc định; 'kanji' hoặc 'custom' (kèm patternUrl) */
  marker?: "hiro" | "kanji" | "custom";
  /** Dùng khi marker="custom" (đường dẫn .patt) */
  patternUrl?: string;
  /** Tùy biến transform cơ bản */
  scale?: string;
  position?: string;
  rotation?: string;
  /** Chiều cao khung AR */
  height?: string;
};

const HIRO_MARKER_IMG =
  "https://raw.githubusercontent.com/AR-js-org/AR.js/master/three.js/data/images/hiro.png";

export default function PoseViewerAR({
  src,
  marker = "hiro",
  patternUrl,
  scale = "0.2 0.2 0.2",
  position = "0 0 0",
  rotation = "0 0 0",
  height = "70vh",
}: Props) {
  const [afReady, setAfReady] = React.useState(false);
  const [arReady, setArReady] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const ua = (typeof navigator !== "undefined" ? navigator.userAgent : "") || "";
    setIsMobile(/android|iphone|ipad|ipod|iemobile|blackberry|opera mini/i.test(ua.toLowerCase()));
  }, []);

  const ready = afReady && arReady;
  const isGLTF =
    !!src && (src.toLowerCase().endsWith(".glb") || src.toLowerCase().endsWith(".gltf"));

  // Trường hợp DESKTOP: chỉ hiện marker Hiro để người dùng mở camera trên mobile quét
  if (!isMobile) {
    return (
      <div className="w-full border rounded p-4 flex flex-col items-center gap-3">
        <div className="text-sm text-neutral-700 text-center">
          Bạn đang ở <b>máy tính</b>. Để xem AR, hãy dùng <b>điện thoại</b> mở trang này
          và hướng camera vào marker bên dưới.
        </div>
        <img
          src={HIRO_MARKER_IMG}
          alt="Hiro marker"
          className="max-w-full h-auto border"
          style={{ width: "320px" }}
        />
        <a
          href={HIRO_MARKER_IMG}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline"
        >
          Tải marker Hiro
        </a>
      </div>
    );
  }

  // MOBILE: dùng camera + marker-based AR
  return (
    <div className="w-full">
      <Script
        src="https://aframe.io/releases/1.5.0/aframe.min.js"
        strategy="afterInteractive"
        onLoad={() => setAfReady(true)}
      />
      <Script
        src="https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/aframe/build/aframe-ar.min.js"
        strategy="afterInteractive"
        onLoad={() => setArReady(true)}
      />

      {!ready && (
        <div className="h-[40vh] md:h-[50vh] flex items-center justify-center text-sm text-neutral-500 border rounded">
          Đang khởi tạo AR…
        </div>
      )}

      {ready && (
        <div className="w-full border rounded overflow-hidden">
          {/* @ts-ignore A-Frame elements */}
          <a-scene
            embedded
            vr-mode-ui="enabled: false"
            renderer="logarithmicDepthBuffer: true; antialias: true;"
            arjs="trackingMethod: best; sourceType: webcam; debugUIEnabled: false;"
            style={{ width: "100%", height }}
          >
            {marker === "hiro" && (
              // @ts-ignore
              <a-marker preset="hiro">
                {isGLTF ? (
                  // @ts-ignore
                  <a-entity
                    gltf-model={`url(${src})`}
                    scale={scale}
                    position={position}
                    rotation={rotation}
                  />
                ) : (
                  // @ts-ignore
                  <a-box position="0 0.5 0" rotation="0 45 0" scale="0.5 0.5 0.5"></a-box>
                )}
              </a-marker>
            )}

            {marker === "kanji" && (
              // @ts-ignore
              <a-marker preset="kanji">
                {isGLTF ? (
                  // @ts-ignore
                  <a-entity gltf-model={`url(${src})`} scale={scale} position={position} rotation={rotation} />
                ) : (
                  // @ts-ignore
                  <a-sphere radius="0.4" position="0 0.4 0"></a-sphere>
                )}
              </a-marker>
            )}

            {marker === "custom" && patternUrl && (
              // @ts-ignore
              <a-marker type="pattern" url={patternUrl}>
                {isGLTF ? (
                  // @ts-ignore
                  <a-entity gltf-model={`url(${src})`} scale={scale} position={position} rotation={rotation} />
                ) : (
                  // @ts-ignore
                  <a-cone height="0.7" radius-bottom="0.3" position="0 0.35 0"></a-cone>
                )}
              </a-marker>
            )}

            {/* @ts-ignore */}
            <a-entity camera></a-entity>
          </a-scene>
        </div>
      )}

      {ready && !isGLTF && (
        <div className="mt-2 text-xs text-amber-600">
          AR chạy tốt nhất với GLB/GLTF. Nếu hiện tại là FBX, hệ thống sẽ tự convert khi bạn bật tab AR.
        </div>
      )}
    </div>
  );
}
