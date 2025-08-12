'use client';

import { useEffect, useRef } from 'react';

export default function ViewerAR({
  modelUrl,
  animationName,
  onCameraError,
  onLoadError,
}: {
  modelUrl: string;
  animationName?: string;
  onCameraError?: (m?: string) => void;
  onLoadError?: (m?: string) => void;
}) {
  const ref = useRef<any>(null);

  // Kiểm tra hỗ trợ & quyền camera cho AR
  useEffect(() => {
    if (!/\.(gltf|glb)$/i.test(modelUrl)) {
      onLoadError?.('AR không hỗ trợ FBX. Vui lòng dùng GLB/GLTF.');
      return;
    }
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          onCameraError?.('Thiết bị không hỗ trợ camera cho AR.');
          return;
        }
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        s.getTracks().forEach(t => t.stop());
      } catch {
        onCameraError?.('Không đọc được camera (AR).');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl]);

  // Set animation nếu GLB có clip trùng tên state
  useEffect(() => {
    if (ref.current && animationName) {
      ref.current.animationName = animationName;
      ref.current.play();
    }
  }, [animationName]);

  return (
    // @ts-ignore - web component
    <model-viewer
      ref={ref}
      src={modelUrl}
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      autoplay
      exposure="1.1"
      environment-image="legacy"
      style={{ width: '100%', height: '100%' }}
      onError={() => onLoadError?.('Không nạp được mô hình 3D (AR).')}
    />
  );
}
