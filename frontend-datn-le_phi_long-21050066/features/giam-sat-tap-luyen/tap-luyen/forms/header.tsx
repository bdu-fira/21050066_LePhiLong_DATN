"use client";
import { CircleArrowLeft, Fullscreen, Minimize } from "lucide-react";
import React from "react";

interface Props {
  screen: any;
  title?: string; // <-- thêm tiêu đề bài tập
}

const HeaderPageTapLuyen = ({ screen, title }: Props) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const enterFullscreen = () => {
    if (screen?.current?.requestFullscreen) {
      screen.current.requestFullscreen();
    }
  };
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  React.useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const onBack = () => {
    if (typeof window !== "undefined") window.history.back();
  };

  return (
    <div className="w-full py-3 px-4 flex items-center justify-between bg-neutral-900/60 rounded-xl">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-white/90 hover:text-white transition"
      >
        <CircleArrowLeft size={32} />
        <span className="hidden sm:inline">Quay lại</span>
      </button>

      <div className="text-base sm:text-lg md:text-xl font-semibold truncate max-w-[60%] text-white/90 text-center">
        {title || "Giám sát tập luyện"}
      </div>

      <button
        onClick={isFullscreen ? exitFullscreen : enterFullscreen}
        className="inline-flex items-center gap-2 text-white/90 hover:text-white transition"
      >
        {isFullscreen ? (
          <>
            <Minimize size={28} />
            <span className="hidden sm:inline">Thoát toàn màn hình</span>
          </>
        ) : (
          <>
            <Fullscreen size={28} />
            <span className="hidden sm:inline">Toàn màn hình</span>
          </>
        )}
      </button>
    </div>
  );
};

export default HeaderPageTapLuyen;
