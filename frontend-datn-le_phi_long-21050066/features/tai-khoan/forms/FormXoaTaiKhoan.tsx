'use client';
import {
  Form,
  FormField
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { xoaTaikhoanSchema } from '@/features/tai-khoan/schemas/deleteTaikhoanSchema';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { deleteTaiKhoan } from '../api/delete';

export type TDeleteUser = z.infer<typeof xoaTaikhoanSchema>

export default function FormXoaTaiKhoan() {
  const [serverStatusCode, setServerStatusCode] = useState<number>()
  const [serverMessage, setServerMessage] = useState<string>()

  const deleteUserForm = useForm<TDeleteUser>({
    resolver: zodResolver(xoaTaikhoanSchema),
    defaultValues: {
      confirmation: '',
    },
  })

  const onSubmit = async (data: any) => {
    try {
      const result = await deleteTaiKhoan();
      setServerStatusCode(result.statusCode);
      if (result?.statusCode === 200) {
        setServerMessage('Xóa thành công!');
        localStorage.clear();
        window.location.replace('/dang-nhap');

      } else {
        setServerMessage(result.message);
      }
    } catch (error: any) {
      setServerMessage('Đã xảy ra lỗi khi xóa tài khoản.');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className='text-white bg-destructive'>Xóa tài khoản</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Form {...deleteUserForm}>
          <form
            onSubmit={deleteUserForm.handleSubmit(onSubmit)}
            className="space-y-6 bg-white dark:bg-muted rounded-lg"
          >
            <DialogHeader>
              <DialogTitle>Xóa tài khoản</DialogTitle>
              <DialogDescription>
                Bạn có chắc muốn xóa tài khoản?
              </DialogDescription>
              <DialogDescription>
                Toàn bộ dữ liệu liên quan, bao gồm thông tin cá nhân, lịch sử tập luyện và các bài tập đã được bạn huấn luyện sẽ được xóa ra khỏi hệ thống.
              </DialogDescription>
              <DialogDescription>
                Nếu bạn muốn tiếp tục, hãy gõ "tôi đã hiểu" vào trường bên dưới và nhấn nút xác nhận.
              </DialogDescription>
              <DialogDescription>
                Thao tác này không thể hoàn trả.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <div className="grid flex-1 gap-2">
                <FormField
                  control={deleteUserForm.control}
                  name="confirmation"
                  render={({ field }) => (
                    <Input type="text" {...field} value={field.value ?? ''} />
                  )}
                />
                {deleteUserForm.formState.errors.confirmation && (
                  <span className="text-red-500 text-xs">
                    {deleteUserForm.formState.errors.confirmation.message}
                  </span>
                )}
                {
                  !deleteUserForm.formState.isSubmitting && serverMessage && serverStatusCode !== 200 &&
                  <span className='text-destructive'>{serverMessage}</span>
                }
                {
                  !deleteUserForm.formState.isSubmitting && serverMessage && serverStatusCode === 200 &&
                  <span className='text-primary'>{serverMessage}</span>
                }
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Hủy
                </Button>
              </DialogClose>
              <Button type="submit" variant="destructive" disabled={deleteUserForm.formState.isSubmitting}>
                {deleteUserForm.formState.isSubmitting && (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
                )}
                Xác nhận
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

  );
}
