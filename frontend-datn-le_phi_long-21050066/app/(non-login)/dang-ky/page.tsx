import FormDangKy from "@/features/dang-ky/forms/FormDangKy";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Đăng nhập | AI Fitness",
  description: "Đăng nhập | AI Fitness",
};

export default function PageDangKy() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-md w-full space-y-2">
        <h1 className="text-4xl text-center mb-4">Đăng ký AI Fitness</h1>
        <FormDangKy />
        <div>
          <p className="text-center">Đã có tài khoản rồi? <Link href={'dang-nhap'} className="text-primary underline font-bold" >Đăng nhập</Link></p>
          <p className="text-center">Bạn quên mật khẩu? <Link href={'quen-mat-khau'} className="text-primary underline font-bold" >Lấy lại mật khẩu</Link></p>
        </div>
      </div>
    </div>
  );
}
