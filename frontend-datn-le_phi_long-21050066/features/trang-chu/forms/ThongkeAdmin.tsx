'use client';

import * as React from 'react';

// ⬇️ Đổi lại đường dẫn nếu bộ shadcn của bạn ở nơi khác
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getAllStats } from '../api/getAllStats';

function formatNumber(n: any) {
  const num = Number(n || 0);
  return new Intl.NumberFormat('vi-VN').format(num);
}

export default function FormThongkeAdmin() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res: any = await getAllStats();
        if (!mounted) return;

        if (res?.statusCode === 200 && res?.data) {
          setData(res.data);
        } else {
          setError(res?.message || 'Không thể tải thống kê.');
        }
      } catch {
        if (mounted) setError('Lỗi hệ thống, vui lòng thử lại sau.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ===== Render =====
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card text-card-foreground p-4 animate-pulse">
            <div className="h-4 w-24 bg-muted rounded mb-4" />
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border p-4 text-sm text-red-600 bg-red-50">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border p-4 text-muted-foreground">
        Không có dữ liệu thống kê.
      </div>
    );
  }

  const {
    trainees = 0,
    exercises = 0,
    createdExercises = 0,
    practicedExercises = 0,
    errors = 0,
    createdSchedules = 0,
  } = data || {};

  const percent =
    createdExercises > 0
      ? Math.round((Number(practicedExercises) / Number(createdExercises)) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-center text-3xl text-primary">Thống kê hệ thống</h2>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Số người tập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(trainees)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng số bài tập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(exercises)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bài tập đã tạo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(createdExercises)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bài tập đã tập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(practicedExercises)}</div>
            <div className="mt-3">
              <Progress value={percent} className="h-2" />
              <div className="mt-2 text-xs text-muted-foreground">
                {percent}% ({formatNumber(practicedExercises)} / {formatNumber(createdExercises)})
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Số lượng lỗi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(errors)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lịch tập đã tạo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(createdSchedules)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
