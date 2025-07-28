'use client';
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { deleteUserSchema } from '@/features/tai-khoan/schemas/deleteUserSchema';
import { updateTaiKhoan } from '@/features/tai-khoan/api/update';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type FormData = z.infer<typeof deleteUserSchema>;

export default function FormXoaTaiKhoan() {
  const [serverStatusCode, setServerStatusCode] = useState<number>()
  const [serverMessage, setServerMessage] = useState<string>()

  const deleteUserForm = useForm<FormData>({
    resolver: zodResolver(deleteUserSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await updateTaiKhoan(data);
      setServerStatusCode(result.statusCode);
      if (result?.statusCode === 200) {
        setServerMessage('Cập nhật thành công!');
        localStorage.setItem('user', JSON.stringify(result.data));
        window.dispatchEvent(new Event('userUpdated'));
      } else {
        setServerMessage(result.message);
      }
    } catch (error: any) {
      setServerMessage('Đã xảy ra lỗi khi cập nhật tài khoản.');
    }
  };

  return (
    <Form {...deleteUserForm}>
      <form
        onSubmit={deleteUserForm.handleSubmit(onSubmit)}
        className="space-y-6 bg-white dark:bg-muted p-6 rounded-lg border-t-1"
      >
        <h2 className='px-2 underline text-primary font-bold text-xl'>Xóa tài khoản</h2>
        <Button type="submit" className="w-full bg-red-700">
          Xóa tài khoản
        </Button>
      </form>
    </Form>
  );
}
