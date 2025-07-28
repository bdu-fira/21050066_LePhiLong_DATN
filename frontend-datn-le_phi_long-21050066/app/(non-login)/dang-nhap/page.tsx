import PageDangnhap from "@/features/dang-nhap/PageDangnhap";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Đăng nhập | AI Fitness",
  description: "Đăng nhập | AI Fitness",
};

export default function DangNhap() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-md w-full space-y-2">
        <h1 className="text-4xl text-center mb-4">Đăng nhập AI Fitness</h1>
        <PageDangnhap />
        <div>
          <p className="text-center">Bạn chưa có tài khoản? <Link href={'dang-ky'} className="text-primary underline font-bold" >Đăng ký</Link></p>
        </div>
      </div>
    </div>
  );
}
