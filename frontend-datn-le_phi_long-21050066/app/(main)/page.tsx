import LichTap from "@/features/trang-chu/LichTap";
import WorkoutPlanSection from "@/features/trang-chu/WorkoutPlan"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang chủ | AI Fitness",
  description: "Trang chủ | AI Fitness",
};

export default function TrangChu() {
  return (
    <div className="max-w-[1200px] mx-auto">
      <LichTap></LichTap>
    </div>
  );
}
