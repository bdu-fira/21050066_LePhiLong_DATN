import CameraCollector from '@/features/collector/cameraCollector'
import React from 'react'

const PageCollector = () => {
  return (
    <div>
      <h1>Thu thập dữ liệu pose</h1>
      <CameraCollector nShots={30} intervalMs={2500} />
    </div>  )
}

export default PageCollector