"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Flame,
  ListTodo,
  Info,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  RefreshCcw,
  CalendarPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { DayItem, WeekItem } from "../schemas/getScheduleSchema";
import { getSchedule } from "../api/getSchedule";

// import WorkoutPlanSection from "./WorkoutPlan"; // bật lại nếu bạn đã có component này

export default function FormLichtap() {
  const router = useRouter();

  const [weeks, setWeeks] = useState<WeekItem[]>([]);
  const [weekIdx, setWeekIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [serverStatusCode, setServerStatusCode] = useState<number | undefined>();
  const [serverMessage, setServerMessage] = useState<string | undefined>();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getSchedule();
        setServerStatusCode(data.statusCode);
        setServerMessage(data.message);
        setWeeks(data.data.weeks ?? []);
        setWeekIdx(0);
        setSelectedIdx(0);
      } catch (err: any) {
        setWeeks([]);
        setServerStatusCode(500);
        setServerMessage(err?.message || "Không thể tải lịch tập.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hasData = weeks.length > 0;

  const weekDays = useMemo<DayItem[]>(() => {
    if (!hasData) return [];
    return weeks[weekIdx]?.days ?? [];
  }, [weeks, weekIdx, hasData]);

  const selectedDay = useMemo<DayItem | null>(() => {
    if (!weekDays.length) return null;
    return weekDays[selectedIdx] ?? null;
  }, [weekDays, selectedIdx]);

  const totalCalories = useMemo(
    () => weekDays.reduce((acc, cur) => acc + (cur?.calories ?? 0), 0),
    [weekDays]
  );
  const totalExercises = useMemo(
    () => weekDays.reduce((acc, cur) => acc + (cur?.exercises ?? 0), 0),
    [weekDays]
  );

  const onPrevWeek = () => {
    if (weekIdx > 0) {
      setWeekIdx(weekIdx - 1);
      setSelectedIdx(0);
    }
  };
  const onNextWeek = () => {
    if (hasData && weekIdx < weeks.length - 1) {
      setWeekIdx(weekIdx + 1);
      setSelectedIdx(0);
    }
  };

  // --- Empty state khi không có dữ liệu ---
  if (!loading && !hasData) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto flex flex-row gap-8 px-6 py-16 items-start max-w-4xl w-full">
          <div className="bg-white shadow-lg border rounded-2xl p-10 w-full text-center">
            <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-muted">
              <CalendarPlus className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Bạn chưa có lịch tập</h2>
            {serverMessage && (
              <p className="text-sm text-muted-foreground mb-6">{serverMessage}</p>
            )}
            <Button
              size="lg"
              className="font-semibold bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => router.push("/tao-lich-tap-hang-tuan")}
            >
              <CalendarPlus className="mr-2 w-5 h-5" />
              Tạo lịch tập
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex flex-row gap-8 px-6 py-10 items-start">
        {/* Card luyện tập */}
        <div className="flex-[1.1] min-w-[380px] max-w-[700px]">
          <div className="bg-white shadow-lg border rounded-2xl p-8 w-full space-y-7">
            {/* Điều hướng tuần */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={onPrevWeek} disabled={weekIdx <= 0 || !hasData}>
                <ChevronLeft />
              </Button>
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold text-primary tracking-tight">
                  {loading ? "Đang tải lịch luyện tập..." : `Lịch luyện tập - ${weeks[weekIdx]?.weekLabel ?? "—"}`}
                </h2>
              </div>
              <Button variant="ghost" onClick={onNextWeek} disabled={!hasData || weekIdx >= weeks.length - 1}>
                <ChevronRight />
              </Button>
            </div>

            {/* Thông báo server */}
            {!loading && serverMessage && serverStatusCode !== 200 && (
              <div className="text-sm text-destructive">{serverMessage}</div>
            )}
            {!loading && serverMessage && serverStatusCode === 200 && (
              <div className="text-sm text-primary">{serverMessage}</div>
            )}

            {/* Dải ngày theo tuần (có dữ liệu) */}
            <div className="flex justify-between gap-2 mb-1">
              {weekDays.length ? (
                weekDays.map((d, idx) => (
                  <Button
                    key={d.date}
                    size="sm"
                    variant={selectedIdx === idx ? "default" : "ghost"}
                    className={cn(
                      "rounded-full px-0 w-16 h-11 text-sm font-bold transition-all duration-150 border-2",
                      selectedIdx === idx
                        ? "bg-orange-500 text-white shadow border-orange-500 scale-105"
                        : "hover:bg-orange-100 text-orange-700 border-transparent"
                    )}
                    onClick={() => setSelectedIdx(idx)}
                    title={d.date}
                  >
                    {formatVN(d.date)}
                  </Button>
                ))
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <RefreshCcw className="w-4 h-4" />
                  {loading ? "Đang tải..." : "Không có dữ liệu tuần."}
                </div>
              )}
            </div>

            {/* Gợi ý nhỏ */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/80 rounded-lg px-4 py-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span>Hiển thị tổng số động tác và tổng kcal dự kiến của từng ngày.</span>
            </div>

            {/* Tổng kết NGÀY */}
            <div className="grid grid-cols-2 gap-5 py-2">
              <SummaryItem
                icon={<ListTodo className="w-6 h-6 text-violet-500" />}
                label="Động tác (ngày)"
                value={selectedDay ? selectedDay.exercises : 0}
              />
              <SummaryItem
                icon={<Flame className="w-6 h-6 text-orange-500" />}
                label="Kcal (ngày)"
                value={selectedDay ? selectedDay.calories : 0}
              />
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 font-bold text-lg text-white shadow bg-orange-500 hover:bg-orange-600 transition-all"
                disabled={!selectedDay}
              >
                <TrendingUp className="mr-2 w-6 h-6" />
                Bắt đầu luyện tập
              </Button>

              {/* Nút tạo lịch nhanh (phòng trường hợp tuần rỗng) */}
              <Button
                size="lg"
                variant="outline"
                className="font-semibold"
                onClick={() => router.push("/lich-tap/tao")}
              >
                <CalendarPlus className="mr-2 w-5 h-5" />
                Tạo lịch tập
              </Button>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-200 my-1" />

            {/* Tổng hợp TUẦN */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-orange-600 text-lg">
                  Tổng hợp {weeks[weekIdx]?.weekLabel ?? "—"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <SummaryItem
                  icon={<ListTodo className="w-6 h-6 text-violet-600" />}
                  label="Tổng động tác (tuần)"
                  value={totalExercises}
                />
                <SummaryItem
                  icon={<Flame className="w-6 h-6 text-orange-500" />}
                  label="Tổng Kcal (tuần)"
                  value={totalCalories}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="flex-[0.9] min-w-[340px] max-w-[440px] flex flex-col gap-8">
          {/* <WorkoutPlanSection userPlan={{ goal: "Tăng cơ & Giảm mỡ" }} /> */}
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-muted/70 p-3 shadow-sm min-h-[70px]">
      {icon}
      <div className="text-xs font-medium text-muted-foreground mt-1">{label}</div>
      <div className="text-xl font-bold text-primary">{value}</div>
    </div>
  );
}

function formatVN(iso: string) {
  // YYYY-MM-DD -> DD/MM
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}
