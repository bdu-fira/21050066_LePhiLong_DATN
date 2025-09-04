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
    <div className="max-w-[1200px] mx-auto flex-col px-4 lg:px-0">
      <FormLichtap />
      <hr className="my-4" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2 pt-2">
        <Thongke />
        <FormPhantichKetquaTapluyen />
      </div>
    </div>
  );
}
