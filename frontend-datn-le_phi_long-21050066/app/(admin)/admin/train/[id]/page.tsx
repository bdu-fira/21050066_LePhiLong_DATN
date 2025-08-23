'use client';

import Script from 'next/script';
import FormCapnhatTieuchi from '@/features/train/forms/formCapnhatTieuchi';
import FormCapnhatThongtinCapdo from '@/features/train/forms/formCapnhatThongtinCapdo';
import FormHuanluyenMohinh from '@/features/train/forms/formHuanluyenMohinh';
import FormCapnhatThongtin from '@/features/train/forms/formCapnhatThongtinBaitap';
import { useEffect, useState } from 'react';
import { findOneExercise } from '@/features/train/api/findoneExercise';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PageTrain() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!id) { setLoading(false); setError('Thiếu id bài tập.'); return; }

    (async () => {
      const res = await findOneExercise(Number(id));
      if (res?.statusCode === 200) {
        setExercise(res.data);
      } else {
        setError(res?.message || 'Không thể tải bài tập.');
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="p-4">Đang tải…</div>;
  if (error || !exercise) return <div className="p-4 text-red-600">{error || 'Không tìm thấy bài tập.'}</div>;

  return (
    <>
    <Button onClick={()=>router.back()}><ArrowLeft/> Quay lại</Button>

    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-[0.5fr_1.4fr] gap-6 p-4">
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js" strategy="afterInteractive" />

      {/* Cột trái */}
      <div className="flex flex-col gap-6 overflow-auto">
        <div className="bg-white rounded-none md:rounded-lg p-4 md:p-6 border">
          <FormCapnhatThongtin
            id={exercise.id}
            name={exercise.name}
            minAge={exercise.minAge}
            maxAge={exercise.maxAge}
            calo={exercise.calo}
            muscles={exercise.muscles}
          />
        </div>

        <div className="bg-white rounded-none md:rounded-lg p-4 md:p-6 border">
          <FormCapnhatThongtinCapdo id={exercise.id} levels={exercise.levels} />
        </div>
      </div>

      {/* Cột phải */}
      <div className="bg-white rounded-none md:rounded-lg p-0 md:p-0 border overflow-hidden">
        <FormHuanluyenMohinh id={exercise.id} positions={exercise.positions} />
      </div>
    </div>
    </>
  );
}
