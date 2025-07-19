"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flame, ListTodo, Clock, Info, TrendingUp, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Line } from "react-chartjs-2";
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import WorkoutPlanSection from "./WorkoutPlan";
Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const allWeeksData = [
  {
    weekLabel: "Tuần 1",
    days: [
      { date: "01/07", exercises: 5, duration: 40, calories: 320, progress: 78, accuracy: 90 },
      { date: "02/07", exercises: 6, duration: 45, calories: 350, progress: 90, accuracy: 92 },
      { date: "03/07", exercises: 4, duration: 35, calories: 270, progress: 60, accuracy: 87 },
      { date: "04/07", exercises: 5, duration: 40, calories: 300, progress: 70, accuracy: 88 },
      { date: "05/07", exercises: 7, duration: 50, calories: 400, progress: 95, accuracy: 93 },
      { date: "06/07", exercises: 3, duration: 30, calories: 210, progress: 40, accuracy: 80 },
      { date: "07/07", exercises: 2, duration: 20, calories: 120, progress: 25, accuracy: 74 },
    ],
  },
  {
    weekLabel: "Tuần 2",
    days: [
      { date: "08/07", exercises: 4, duration: 30, calories: 250, progress: 60, accuracy: 84 },
      { date: "09/07", exercises: 5, duration: 40, calories: 320, progress: 80, accuracy: 88 },
      { date: "10/07", exercises: 3, duration: 25, calories: 210, progress: 40, accuracy: 82 },
      { date: "11/07", exercises: 4, duration: 35, calories: 260, progress: 68, accuracy: 85 },
      { date: "12/07", exercises: 6, duration: 48, calories: 380, progress: 85, accuracy: 91 },
      { date: "13/07", exercises: 2, duration: 18, calories: 100, progress: 22, accuracy: 77 },
      { date: "14/07", exercises: 1, duration: 12, calories: 60, progress: 18, accuracy: 70 },
    ],
  },
];

export default function LichTap() {
  const [weekIdx, setWeekIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const weekDays = allWeeksData[weekIdx].days;
  const selectedDay = weekDays[selectedIdx];

  // Tổng hợp tuần
  const completedDays = weekDays.filter(d => d.progress >= 70).length;
  const totalCalories = weekDays.reduce((acc, cur) => acc + cur.calories, 0);
  const totalTime = weekDays.reduce((acc, cur) => acc + cur.duration, 0);

  // Dữ liệu biểu đồ
  const labels = weekDays.map(d => d.date);
  const progressData = weekDays.map(d => d.progress);
  const accuracyData = weekDays.map(d => d.accuracy);

  // Chartjs data và options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: { min: 0, max: 100, ticks: { stepSize: 20 }, grid: { color: "#e5e7eb" } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex flex-row gap-8 px-6 py-10 items-start">
        {/* Card luyện tập */}
        <div className="flex-[1.1] min-w-[380px] max-w-[700px]">
          <div className="bg-white shadow-lg border rounded-2xl p-8 w-full space-y-7">
            {/* Chọn tuần */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={() => { if (weekIdx < allWeeksData.length - 1) { setWeekIdx(weekIdx + 1); setSelectedIdx(0); }}} disabled={weekIdx >= allWeeksData.length - 1}>
                <ChevronLeft />
              </Button>
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold text-primary tracking-tight">
                  Lịch luyện tập - {allWeeksData[weekIdx].weekLabel}
                </h2>
              </div>
              <Button variant="ghost" onClick={() => { if (weekIdx > 0) { setWeekIdx(weekIdx - 1); setSelectedIdx(0); }}} disabled={weekIdx <= 0}>
                <ChevronRight />
              </Button>
            </div>

            {/* Ngày theo date, dạng button */}
            <div className="flex justify-between gap-2 mb-1">
              {weekDays.map((d, idx) => (
                <Button
                  key={d.date}
                  size="sm"
                  variant={selectedIdx === idx ? "default" : "ghost"}
                  className={cn(
                    "rounded-full px-0 w-14 h-11 text-sm font-bold transition-all duration-150 border-2",
                    selectedIdx === idx
                      ? "bg-orange-500 text-white shadow border-orange-500 scale-105"
                      : "hover:bg-orange-100 text-orange-700 border-transparent"
                  )}
                  onClick={() => setSelectedIdx(idx)}
                >
                  {d.date}
                </Button>
              ))}
            </div>
            
            {/* Thông báo nhỏ */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/80 rounded-lg px-4 py-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span>
                Đừng bỏ lỡ buổi luyện tập hôm nay để đạt mục tiêu nhé!
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full my-2">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">Tiến độ ngày</span>
                <span className="text-xs font-semibold text-orange-500">{selectedDay.progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${selectedDay.progress}%` }}
                />
              </div>
            </div>

            {/* Thông số tổng kết ngày */}
            <div className="grid grid-cols-3 gap-5 py-2">
              <SummaryItem
                icon={<ListTodo className="w-6 h-6 text-violet-500" />}
                label="Động tác"
                value={selectedDay.exercises}
              />
              <SummaryItem
                icon={<Clock className="w-6 h-6 text-cyan-500" />}
                label="Thời gian"
                value={selectedDay.duration + "p"}
              />
              <SummaryItem
                icon={<Flame className="w-6 h-6 text-orange-500" />}
                label="Kcal"
                value={selectedDay.calories}
              />
            </div>

            {/* Nút bắt đầu */}
            <Button
              size="lg"
              className="w-full font-bold text-lg text-white shadow bg-orange-500 hover:bg-orange-600 transition-all"
            >
              <TrendingUp className="mr-2 w-6 h-6" />
              Bắt đầu luyện tập
            </Button>

            {/* Divider nhỏ */}
            <div className="w-full h-px bg-gray-200 my-1" />

            {/* Tổng hợp tuần đang chọn */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-orange-600 text-lg">Tổng hợp {allWeeksData[weekIdx].weekLabel}</span>
              </div>
              <div className="grid grid-cols-3 gap-5">
                <SummaryItem
                  icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
                  label="Buổi đã tập"
                  value={`${completedDays}/${weekDays.length}`}
                />
                <SummaryItem
                  icon={<Flame className="w-6 h-6 text-orange-500" />}
                  label="Kcal"
                  value={totalCalories}
                />
                <SummaryItem
                  icon={<Clock className="w-6 h-6 text-cyan-500" />}
                  label="Phút tập"
                  value={totalTime + "p"}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Biểu đồ bên phải */}
        <div className="flex-[0.9] min-w-[340px] max-w-[440px] flex flex-col gap-8">
          {/* Biểu đồ tiến trình */}
          <div className="bg-white shadow-md rounded-2xl p-5">
            <div className="font-semibold mb-3 text-orange-600 text-base">Tiến độ từng ngày</div>
            <div className="h-[180px] w-full">
              <Line
                data={{
                  labels,
                  datasets: [
                    {
                      label: "Tiến độ (%)",
                      data: progressData,
                      borderColor: "#fb923c",
                      backgroundColor: "rgba(251,146,60,0.14)",
                      fill: true,
                      pointBackgroundColor: "#fb923c",
                      tension: 0.4,
                    },
                  ],
                }}
                options={lineChartOptions}
              />
            </div>
          </div>
          {/* Biểu đồ độ chính xác */}
          <div className="bg-white shadow-md rounded-2xl p-5">
            <div className="font-semibold mb-3 text-sky-600 text-base">Độ chính xác động tác</div>
            <div className="h-[180px] w-full">
              <Line
                data={{
                  labels,
                  datasets: [
                    {
                      label: "Độ chính xác (%)",
                      data: accuracyData,
                      borderColor: "#38bdf8",
                      backgroundColor: "rgba(56,189,248,0.13)",
                      fill: true,
                      pointBackgroundColor: "#38bdf8",
                      tension: 0.4,
                    },
                  ],
                }}
                options={lineChartOptions}
              />
            </div>
          </div>
          <WorkoutPlanSection userPlan={{ goal: "Tăng cơ & Giảm mỡ" }} />

        </div>
      </div>
    </div>
  );
}

function SummaryItem({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-muted/70 p-3 shadow-sm min-h-[70px]">
      {icon}
      <div className="text-xs font-medium text-muted-foreground mt-1">{label}</div>
      <div className="text-xl font-bold text-primary">{value}</div>
    </div>
  );
}
