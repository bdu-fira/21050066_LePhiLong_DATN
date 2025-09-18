import { Button } from '@/components/ui/button'
import { SkipBack, SkipForward } from 'lucide-react'
import React from 'react'

const FooterPageTapLuyen = ({ onPrev, onNext, currentIndex, total }: any) => {
  return (
    <div className='flex justify-between items-center border-t-2 pt-2 gap-2'>
      <Button
        disabled={currentIndex === 0}
        onClick={onPrev}
        className='bg-white/0 text-white flex items-center gap-2 text-base sm:text-2xl hover:bg-white rounded-md px-3 py-2 hover:text-black transition'
      >
        <SkipBack size={28} />
        <span className="hidden xs:inline">Động tác trước</span>
      </Button>
      <Button
        disabled={currentIndex === total-1}
        onClick={onNext}
        className='bg-white/0 text-white flex items-center gap-2 text-base sm:text-2xl hover:bg-white rounded-md px-3 py-2 hover:text-black transition'
      >
        <SkipForward size={28} />
        <span className="hidden xs:inline">Động tác sau</span>
      </Button>
    </div>
  )
}
export default FooterPageTapLuyen
