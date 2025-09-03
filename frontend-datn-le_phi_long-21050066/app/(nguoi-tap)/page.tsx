import FormLichtap from "@/features/trang-chu/forms/LichTap";
import FormPhantichKetquaTapluyen from "@/features/trang-chu/forms/Phantich";
import Thongke from "@/features/trang-chu/forms/Thongke";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang chủ | AI Fitness",
  description: "Trang chủ | AI Fitness",
};

export default function TrangChu() {
  return (
    <div className="max-w-[1200px] mx-auto flex-col">
      <FormLichtap></FormLichtap>
      <hr/>
      <div className="grid grid-cols-2 mt-2 pt-2 gap-4">
        <Thongke />
        <FormPhantichKetquaTapluyen />
      </div>
    </div>

  );
}
