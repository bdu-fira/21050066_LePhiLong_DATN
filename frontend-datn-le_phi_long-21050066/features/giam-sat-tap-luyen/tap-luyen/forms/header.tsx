"use client";
import { CircleArrowLeft, Fullscreen, Minimize } from "lucide-react";
import React from "react";

interface Props { screen: any; title?: string; }

const HeaderPageTapLuyen = ({ screen, title }: Props) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const enterFullscreen = () => { if (screen?.current?.requestFullscreen) screen.current.requestFullscreen(); };
  const exitFullscreen = () => { if (document.exitFullscreen) document.exitFullscreen(); };
  React.useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const onBack = () => { if (typeof window !== "undefined") window.history.back(); };

  return (
    <div className="w-full py-2 px-3 flex items-center justify-between bg-neutral-900/60 rounded-xl">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-white/90 hover:text-white transition">
        <CircleArrowLeft size={24} />
        <span className="hidden sm:inline text-sm">Quay lại</span>
      </button>

      <div className="text-sm sm:text-base md:text-lg font-semibold truncate max-w-[60%] text-white/90 text-center">
        {title || "Giám sát tập luyện"}
      </div>

      <button onClick={isFullscreen ? exitFullscreen : enterFullscreen} className="inline-flex items-center gap-1.5 text-white/90 hover:text-white transition">
        {isFullscreen ? (<><Minimize size={22} /><span className="hidden sm:inline text-sm">Thoát</span></>) : (<><Fullscreen size={22} /><span className="hidden sm:inline text-sm">Full</span></>)}
      </button>
    </div>
  );
};
export default HeaderPageTapLuyen;
