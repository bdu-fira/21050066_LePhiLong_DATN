import { CircleArrowLeft, SkipBack, SkipForward } from 'lucide-react'
import React from 'react'

const FooterPageTapLuyen = () => {
  return (
    <div className='flex justify-between items-center border-t-2 pt-2'>
            <button className='bg-white/0 text-white flex justify-center items-center gap-2 text-2xl hover:bg-white rounded-md px-4 py-2 hover:text-black transition duration-150 ease-in-out'>
                <SkipBack size={48} />
                Động tác trước
            </button>
            <button className='bg-white/0 text-white flex justify-center items-center gap-2 text-2xl hover:bg-white rounded-md px-4 py-2 hover:text-black transition duration-150 ease-in-out'>
                <SkipForward size={48} />
                Động tác sau
            </button>
        </div>
  )
}

export default FooterPageTapLuyen