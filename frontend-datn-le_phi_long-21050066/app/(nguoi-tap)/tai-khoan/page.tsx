'use client';

import FormCapnhatTaikhoan from "@/features/tai-khoan/forms/FormCapnhatTaikhoan";
import FormCapNhatThongTinCaNhan from "@/features/tai-khoan/forms/FormCapnhatThongtinCanhan";
import FormXoaTaiKhoan from "@/features/tai-khoan/forms/FormXoaTaiKhoan";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl w-full mx-auto">
      <h1 className='font-bold text-xl text-center'>Cập nhật thông tin</h1>
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl mx-auto mt-4 space-y-18">
        <FormCapnhatTaikhoan />
        <FormCapNhatThongTinCaNhan />
        <FormXoaTaiKhoan />
      </div>
    </div>
  );
}
