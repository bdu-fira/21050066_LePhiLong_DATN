'use client';

import FormCaiDatTaiKhoan from "@/features/tai-khoan/FormCaiDatTaiKhoan";
import FormXoaTaiKhoan from "@/features/tai-khoan/FormXoaTaiKhoan";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl w-full mx-auto">
      <h1 className='font-bold text-2xl text-center'>Cập nhật thông tin</h1>
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl mx-auto mt-4 space-y-18">
        <FormCaiDatTaiKhoan />
        <FormXoaTaiKhoan />
      </div>
    </div>
  );
}
