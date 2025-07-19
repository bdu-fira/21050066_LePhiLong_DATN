'use client'
import FooterPageTapLuyen from '@/features/tap-luyen/footer'
import HeaderPageTapLuyen from '@/features/tap-luyen/header'
import InputSection from '@/features/tap-luyen/inputSection'
import MonitorSection from '@/features/tap-luyen/monitorSection'
import React, { useRef } from 'react'


const PageTapLuyen = () => {
    const screen = useRef(null)
    return (
        <div ref={screen} className='bg-black text-white w-screen flex flex-col gap-8 p-10'>
            <HeaderPageTapLuyen screen={screen}/>
            <div className='flex justify-between px-4 flex-1'>
                <InputSection />
                <MonitorSection reps={1} />
            </div>
            <FooterPageTapLuyen />
        </div>
    )
}

export default PageTapLuyen