'use client';
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { quenMatkhauSchema } from '@/features/quen-mat-khau/schemas/quenMatkhauSchema';
import { lostPassword } from '../api/lostPassword';

type FormData = z.infer<typeof quenMatkhauSchema>;

export default function FormQuenMatkhau() {
  const [serverStatusCode, setServerStatusCode] = useState<number>()
  const [serverMessage, setServerMessage] = useState<string>()
  const lostPasswordForm = useForm<FormData>({
    resolver: zodResolver(quenMatkhauSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await lostPassword(data);
      setServerStatusCode(result.statusCode);
      if (result?.statusCode === 200) {
        setServerMessage('Đã gửi đường link lấy lại mật khẩu thành công, vui lòng kiểm tra hộp thư email. Nếu không tìm thấy, hãy kiểm tra thư mục spam.');
      } else {
        setServerMessage(result.message);
      }
    } catch (error: any) {
      setServerMessage('Đã xảy ra lỗi khi cập nhật tài khoản.');
    }
  };

  return (
    <Form {...lostPasswordForm}>
      <h1 className="text-4xl text-center mb-4">Quên mật khẩu</h1>
      <form
        autoComplete="off"
        onSubmit={lostPasswordForm.handleSubmit(onSubmit)}
        className="space-y-6 bg-white dark:bg-muted p-6 rounded-lg justify-shadow"
      >
        <FormField
          control={lostPasswordForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} name={'email'} autoComplete='off'/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {
          !lostPasswordForm.formState.isSubmitting && serverMessage && serverStatusCode !== 200 &&
          <span className='text-destructive'>{serverMessage}</span>
        }
        {
          !lostPasswordForm.formState.isSubmitting && serverMessage && serverStatusCode === 200 &&
          <span className='text-primary'>{serverMessage}</span>
        }
        <Button type="submit" className="w-full" disabled={lostPasswordForm.formState.isSubmitting}>
          {lostPasswordForm.formState.isSubmitting && (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
          )}
          Lấy lại mật khẩu
        </Button>
      </form>
    </Form>
  );
}
