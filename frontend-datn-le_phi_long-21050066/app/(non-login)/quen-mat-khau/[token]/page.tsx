import FormLaylaiMatkhau from "@/features/quen-mat-khau/forms/FormLaylaiMatkhau";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lấy lại mật khẩu | AI Fitness",
  description: "Lấy lại mật khẩu | AI Fitness",
};

export default async function PageLaylaiMatkhau({ params }: { params: Promise<{ token: string }> }) {
  const p = await params
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-md w-full space-y-2">
        <FormLaylaiMatkhau token={p.token}/>
        <div>
          <p className="text-center">Quay lại trang quên mật khẩu <Link href={'/quen-mat-khau'} className="text-primary underline font-bold" >Quên mật khẩu</Link></p>
        </div>
      </div>
    </div>
  );
}
