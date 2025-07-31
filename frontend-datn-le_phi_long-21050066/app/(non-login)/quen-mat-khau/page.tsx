import FormQuenMatkhau from "@/features/quen-mat-khau/forms/FormQuenMatkhau";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quên mật khẩu | AI Fitness",
  description: "Quên mật khẩu | AI Fitness",
};

export default function PageQuenMatKhau() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-md w-full space-y-2">
        <FormQuenMatkhau />
        <div>
          <p className="text-center">Đã có tài khoản rồi? <Link href={'dang-nhap'} className="text-primary underline font-bold" >Đăng nhập</Link></p>
          <p className="text-center">Bạn chưa có tài khoản? <Link href={'dang-ky'} className="text-primary underline font-bold" >Đăng ký</Link></p>
        </div>
      </div>
    </div>
  );
}
