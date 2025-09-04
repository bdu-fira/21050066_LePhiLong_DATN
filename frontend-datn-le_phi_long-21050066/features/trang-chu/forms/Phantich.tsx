'use client';

import * as React from 'react';

// shadcn/ui (đổi path nếu cấu trúc dự án khác)
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { getAnalytics } from '../api/getAnalytics';

// ====== Types khớp response backend ======
type Stage = { count: number; percent: number };
type Summary = {
  totalWrong: number;
  stage: { early: Stage; mid: Stage; late: Stage };
};
type TopExercise = { exerciseID: number; exerciseName: string; wrongCount: number };

type AnalyticsData = {
  summary: Summary;
  topExercises: TopExercise[];
};

type ApiResponse = {
  statusCode: number;
  message?: string;
  data?: AnalyticsData;
};

// ====== Helpers ======
function formatNumber(n: number | undefined | null) {
  const num = Number(n || 0);
  return new Intl.NumberFormat('vi-VN').format(num);
}
const clampPercent = (p?: number) => {
  const n = Number.isFinite(Number(p)) ? Number(p) : 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return Math.round(n * 100) / 100; // 2 chữ số thập phân
};

export default function FormPhantichKetquaTapluyen() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res: ApiResponse = await getAnalytics();
        if (!mounted) return;
        if (res?.statusCode === 200 && res?.data) {
          setData(res.data);
        } else {
          setError(res?.message || 'Không thể tải phân tích.');
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

  // ====== Render ======
  if (loading) {
    return (
      <div className="space-y-6 px-4 sm:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card text-card-foreground p-4 animate-pulse">
              <div className="h-4 w-24 bg-muted rounded mb-4" />
              <div className="h-8 w-24 bg-muted rounded" />
              <div className="h-2 w-full bg-muted rounded mt-4" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border p-4">
          <div className="h-6 w-48 bg-muted rounded mb-4 animate-pulse" />
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
        Không có dữ liệu phân tích.
      </div>
    );
  }

  const { summary, topExercises } = data;
  const earlyPct = clampPercent(summary?.stage?.early?.percent);
  const midPct   = clampPercent(summary?.stage?.mid?.percent);
  const latePct  = clampPercent(summary?.stage?.late?.percent);

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* ====== Summary: 4 thẻ, mobile 1 cột, tablet 2 cột, desktop 4 cột ====== */}
      <h2 className="text-center text-2xl sm:text-3xl text-primary font-semibold">Phân tích</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng số lỗi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(summary.totalWrong)}</div>
            <div className="mt-2 text-xs text-muted-foreground">Tổng số lần thực hiện sai</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sai ở giai đoạn đầu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(summary.stage.early.count)}</div>
            <div className="mt-3">
              <Progress value={earlyPct} className="h-2" />
              <div className="mt-2 text-xs text-muted-foreground">{earlyPct}% tổng số lỗi</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sai ở giai đoạn giữa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(summary.stage.mid.count)}</div>
            <div className="mt-3">
              <Progress value={midPct} className="h-2" />
              <div className="mt-2 text-xs text-muted-foreground">{midPct}% tổng số lỗi</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sai ở giai đoạn cuối</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatNumber(summary.stage.late.count)}</div>
            <div className="mt-3">
              <Progress value={latePct} className="h-2" />
              <div className="mt-2 text-xs text-muted-foreground">{latePct}% tổng số lỗi</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ====== Bảng top bài tập sai nhiều nhất (scroll ngang khi hẹp) ====== */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Bài tập sai nhiều nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="-mx-4 sm:mx-0 overflow-x-auto">
            <div className="inline-block min-w-[520px] align-middle">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>Bài tập</TableHead>
                    <TableHead className="text-right">Số lỗi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topExercises?.length ? (
                    topExercises.map((ex, idx) => (
                      <TableRow key={`${ex.exerciseID}-${idx}`}>
                        <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{ex.exerciseName}</TableCell>
                        <TableCell className="text-right">{formatNumber(ex.wrongCount)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Chưa có dữ liệu lỗi để xếp hạng bài tập.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
