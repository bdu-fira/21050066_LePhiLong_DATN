'use client'
import { CircleArrowLeft, Fullscreen, Minimize } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

interface Props {
    screen: any
}

const HeaderPageTapLuyen = (props: Props) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const enterFullscreen = () => {
        if (props.screen.current) {
            props.screen.current.requestFullscreen();
        }
    };

    const exitFullscreen = () => {
        document.exitFullscreen();
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
          setIsFullscreen(!!document.fullscreenElement);
        };
    
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
          document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
      }, []);
      
    return (
        <div className='flex justify-between items-center border-b-2 pb-2'>
            <a className='bg-white/0 text-white flex justify-center items-center gap-2 text-2xl hover:bg-white rounded-md px-4 py-2 hover:text-black transition duration-150 ease-in-out' href='/'>
                <CircleArrowLeft size={48} />
                Quay lại
            </a>
            <p className='text-2xl absolute left-[50%] -translate-x-1/2'>Cuốn tạ đơn</p>
            <button className='bg-white/0 text-white flex justify-center items-center gap-2 text-2xl hover:bg-white rounded-md px-4 py-2 hover:text-black transition duration-150 ease-in-out' onClick={!isFullscreen ? enterFullscreen : exitFullscreen}>
                {
                    !isFullscreen ?
                    <>
                        <Fullscreen size={48} />
                        Toàn màn hình
                    </>
                    :
                    <>
                        <Minimize size={48} />
                        Thoát toàn màn hình
                    </>
                }
            </button>
        </div>
    )
}

export default HeaderPageTapLuyen