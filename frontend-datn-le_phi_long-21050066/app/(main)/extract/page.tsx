"use client";
import BatchPoseExtractor from '@/features/train/PoseExtractor';
import Script from 'next/script';
import React from 'react'

const PageTrain = () => {

  return (
    <div>
        <Script 
            src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js"
            strategy="afterInteractive"
            onLoad={() => {
                console.log('Script loaded!');
              }}
        />

      <BatchPoseExtractor/>
        
    </div>
  )
}

export default PageTrain