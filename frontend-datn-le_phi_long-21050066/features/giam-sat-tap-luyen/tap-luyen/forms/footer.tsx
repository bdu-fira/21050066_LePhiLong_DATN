import { SkipBack, SkipForward, Timer } from 'lucide-react'
import React from 'react'

const FooterPageTapLuyen = ({ onPrev, onNext, onRest }: any) => {
  return (
    <div className='flex justify-between items-center border-t-2 pt-2 gap-4'>
      <button onClick={onPrev} className='bg-white/0 text-white flex justify-center items-center gap-2 text-2xl hover:bg-white rounded-md px-4 py-2 hover:text-black transition duration-150 ease-in-out'>
        <SkipBack size={48} />
        Động tác trước
      </button>
      <button onClick={onRest} className='bg-white/0 text-white flex justify-center items-center gap-2 text-2xl hover:bg-white rounded-md px-4 py-2 hover:text-black transition duration-150 ease-in-out'>
        <Timer size={48} />
        Nghỉ 30s
      </button>
      <button onClick={onNext} className='bg-white/0 text-white flex justify-center items-center gap-2 text-2xl hover:bg-white rounded-md px-4 py-2 hover:text-black transition duration-150 ease-in-out'>
        <SkipForward size={48} />
        Động tác sau
      </button>
    </div>
  )
}

export default FooterPageTapLuyen
