import FormLichtap from "@/features/trang-chu/forms/LichTap";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang chủ | AI Fitness",
  description: "Trang chủ | AI Fitness",
};

export default function TrangChu() {
  return (
    <div className="max-w-[1200px] mx-auto">
      <FormLichtap></FormLichtap>
    </div>
  );
}
