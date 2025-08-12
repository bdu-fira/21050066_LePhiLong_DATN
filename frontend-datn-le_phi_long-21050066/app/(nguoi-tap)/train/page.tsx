// app/(train)/page.tsx
'use client';

import Script from 'next/script';
import FormExpert from '@/features/train/forms/formExpert';
import FormLevelInfo from '@/features/train/forms/formLevelInfo';
import FormTrain from '@/features/train/forms/formTrain';
import FormUpdateInfo from '@/features/train/forms/formUpdateInfo';
import { useState } from 'react';

export default function PageTrain() {
  const [labels] = useState<string[]>([]); // có thể nối từ FormTrain qua event sau

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-[0.9fr_1.4fr] gap-6 p-4">
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js"
        strategy="afterInteractive"
      />

      {/* Cột trái: 3 form xếp chồng */}
      <div className="flex flex-col gap-6 overflow-auto">
        <div className="bg-white rounded-none md:rounded-lg p-4 md:p-6 border">
          <FormUpdateInfo />
        </div>
        <div className="bg-white rounded-none md:rounded-lg p-4 md:p-6 border">
          <FormLevelInfo />
        </div>
        <div className="bg-white rounded-none md:rounded-lg p-4 md:p-6 border">
          <FormExpert labels={labels} />
        </div>
      </div>

      {/* Cột phải: FormTrain */}
      <div className="bg-white rounded-none md:rounded-lg p-0 md:p-0 border overflow-hidden">
        <FormTrain />
      </div>
    </div>
  );
}
