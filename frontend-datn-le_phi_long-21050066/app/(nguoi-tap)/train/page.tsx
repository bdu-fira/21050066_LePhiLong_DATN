"use client";
import FormTrain from '@/features/train/forms/formTrain';
import Script from 'next/script';
import React from 'react'

const PageTrain = () => {
  return (
    <div className='w-full h-screen'>
        <Script 
            src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js"
            strategy="afterInteractive"
            onLoad={() => {
                console.log('Script loaded!');
              }}
        />
        <FormTrain/>        
    </div>
  )
}

export default PageTrain