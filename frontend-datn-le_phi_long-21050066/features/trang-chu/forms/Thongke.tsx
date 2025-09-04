'use client';

import * as React from 'react';
import { getStats } from '../api/getStats';

// ⬇️ Đổi lại đường dẫn nếu bộ shadcn của bạn ở nơi khác
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// ===== Types khớp response backend =====
type DayStat = {
  date: string;           // "YYYY-MM-DD"
  label: string;          // "dd/MM"
  exercises: number;
  trained: number;
  calories: number;
  wrongActions: number;
};

type StatsData = {
  summary: {
    progressText: string;       // "x/y"
    trainedExercises: number;
    totalExercises: number;
    calories: number;
    wrongActions: number;
  };
  days: DayStat[];
};

type ApiResponse = {
  statusCode: number;
  message?: string;
  data?: StatsData;
};

function formatNumber(n: number | undefined | null) {
  const num = Number(n || 0);
  return new Intl.NumberFormat('vi-VN').format(num);
}

export default function FormThongkeKetquaTapluyen() {
  const [data, setData] = React.useState<StatsData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res: ApiResponse = await getStats();
        if (mounted) {
          if (res?.statusCode === 200 && res?.data) {
            setData(res.data);
          } else {
            setError(res?.message || 'Không thể tải thống kê.');
          }
        }
      } catch {
        if (mounted) setError('Lỗi hệ thống, vui lòng thử lại sau.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

  return () => { mounted = false; };
  }, []);

  // ====== Render ======
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 sm:px-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card text-card-foreground p-4 animate-pulse">
            <div className="h-4 w-24 bg-muted rounded mb-4" />
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
        ))}
        <div className="col-span-full rounded-lg border p-4 mt-2">
          <div className="h-6 w-40 bg-muted rounded mb-4 animate-pulse" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 w-full bg-muted/50 rounded mb-2 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border p-4 text-sm text-red-600 bg-red-50 px-4 sm:px-0">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border p-4 text-muted-foreground px-4 sm:px-0">
        Không có dữ liệu thống kê.
      </div>
    );
  }

  const { summary } = data;
  const percent =
    summary.totalExercises > 0
      ? Math.round((summary.trainedExercises / summary.totalExercises) * 100)
      : 0;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Summary cards */}
      <h2 className="text-center text-2xl sm:text-3xl text-primary font-semibold">Thống kê</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tiến độ hiện tại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.progressText}</div>
            <div className="mt-3">
              <Progress value={percent} className="h-2" />
              <div className="mt-2 text-xs text-muted-foreground">{percent}% hoàn thành</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Số bài đã tập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(summary.trainedExercises)}</div>
            <div className="mt-2 text-xs text-muted-foreground">/ {formatNumber(summary.totalExercises)} bài</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Calo đã đốt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(summary.calories)}</div>
            <div className="mt-2 text-xs text-muted-foreground">Đơn vị: calo</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Số lượng động tác sai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(summary.wrongActions)}</div>
            <div className="mt-2 text-xs text-muted-foreground">Đếm theo số lần sai</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
