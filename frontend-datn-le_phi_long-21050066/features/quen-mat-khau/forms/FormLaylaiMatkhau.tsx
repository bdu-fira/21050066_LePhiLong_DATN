'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { laylaiMatkhauSchema } from '@/features/quen-mat-khau/schemas/laylaiMatkhauSchema';
import { updatePassword } from '../api/updatePassword';
import { validateToken } from '../api/validateToken';

type FormData = z.infer<typeof laylaiMatkhauSchema>;

export default function FormLaylaiMatkhau({ token }: { token: string }) {
  // Trạng thái kiểm tra token
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  // Thông báo và mã trạng thái cho form
  const [serverStatusCode, setServerStatusCode] = useState<number>();
  const [serverMessage, setServerMessage] = useState<string>();

  // Tạo form
  const updatePasswordForm = useForm<FormData>({
    resolver: zodResolver(laylaiMatkhauSchema),
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
  });

  // Kiểm tra token khi vào trang
  useEffect(() => {
    async function checkToken() {
      const res = await validateToken(token);
      if (res.statusCode === 200) {
        setIsTokenValid(true);
      } else {
        setIsTokenValid(false);
        setServerMessage(res.message || 'Token không hợp lệ hoặc đã hết hạn!');
      }
    }
    checkToken();
  }, [token]);

  // Xử lý khi submit form đổi mật khẩu
  const onSubmit = async (formData: FormData) => {
    try {
      const result = await updatePassword(formData);
      setServerStatusCode(result.statusCode);
      setServerMessage(result.message);
    } catch {
      setServerMessage('Đã xảy ra lỗi khi cập nhật tài khoản.');
    }
  };

  // Loading khi kiểm tra token
  if (isTokenValid === null) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></span>
      </div>
    );
  }

  // Nếu token không hợp lệ, chỉ hiện message lỗi
  if (isTokenValid === false) {
    return (
      <div className="text-center text-destructive text-lg font-semibold min-h-[200px] flex items-center justify-center">
        {serverMessage || 'Token không hợp lệ hoặc đã hết hạn!'}
      </div>
    );
  }

  // Nếu token hợp lệ, hiển thị form đổi mật khẩu
  return (
    <Form {...updatePasswordForm}>
      <h1 className="text-4xl text-center mb-4">Tạo mật khẩu mới</h1>
      <form
        autoComplete="off"
        onSubmit={updatePasswordForm.handleSubmit(onSubmit)}
        className="space-y-6 bg-white dark:bg-muted p-6 rounded-lg justify-shadow"
      >
        {/* Token hidden field */}
        <FormField
          control={updatePasswordForm.control}
          name="token"
          render={({ field }) => (
            <input
              type="hidden"
              value={field.value}
              name="token"
              ref={field.ref}
              onChange={field.onChange}
            />
          )}
        />

        {/* Password field */}
        <FormField
          control={updatePasswordForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu mới</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  {...field}
                  name="new_password"
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirm password field */}
        <FormField
          control={updatePasswordForm.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nhập lại mật khẩu mới</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  {...field}
                  name="confirm_new_password"
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Thông báo lỗi hoặc thành công */}
        {!updatePasswordForm.formState.isSubmitting && serverMessage && serverStatusCode !== 200 && (
          <span className="text-destructive">{serverMessage}</span>
        )}
        {!updatePasswordForm.formState.isSubmitting && serverMessage && serverStatusCode === 200 && (
          <span className="text-primary">{serverMessage}</span>
        )}

        {/* Nút submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={updatePasswordForm.formState.isSubmitting}
        >
          {updatePasswordForm.formState.isSubmitting && (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
          )}
          Cập nhật mật khẩu
        </Button>
      </form>
    </Form>
  );
}
