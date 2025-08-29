import { Button } from '@/components/ui/button'
import { SkipBack, SkipForward } from 'lucide-react'
import React from 'react'

const FooterPageTapLuyen = ({ onPrev, onNext, currentIndex, total }: any) => {
  return (
    <div className='flex justify-between items-center border-t-2 pt-2 gap-4'>
      <Button disabled={currentIndex === 0} onClick={onPrev} className='bg-white/0 text-white flex justify-center items-center gap-2 text-3xl hover:bg-white rounded-md px-4 py-2 hover:text-black transition duration-150 ease-in-out'>
        <SkipBack size={60} />
        Động tác trước
      </Button>
      <Button disabled={currentIndex === total-1} onClick={onNext} className='bg-white/0 text-white flex justify-center items-center gap-2 text-3xl hover:bg-white rounded-md px-4 py-4 hover:text-black transition duration-150 ease-in-out'>
        <SkipForward size={60} />
        Động tác sau
      </Button>
    </div>
  )
}

export default FooterPageTapLuyen
