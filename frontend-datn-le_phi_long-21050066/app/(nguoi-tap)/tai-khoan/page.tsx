'use client';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { caiDatTaiKhoanSchema } from '@/features/tai-khoan/schemas/caiDatTaiKhoanSchema';
import { updateTaiKhoan } from '../../../features/tai-khoan/api/update';
import { useEffect, useState } from 'react';
import { getTaiKhoan } from '@/features/tai-khoan/api/get';

type FormData = z.infer<typeof caiDatTaiKhoanSchema>;

export default function PageCaiDatTaiKhoan() {
  const [serverStatusCode, setServerStatusCode] = useState<number>()
  const [serverMessage, setServerMessage] = useState<string>()
  const form = useForm<FormData>({
    resolver: zodResolver(caiDatTaiKhoanSchema),
    defaultValues: {
      name: '',
      gender: "1",
      dateOfBirth: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')!);
    user.gender = user.gender.toString()
    const dateOfBirth = new Date(user.dateOfBirth)
    user.dateOfBirth = dateOfBirth.toISOString().slice(0, 10)
    form.reset(user)

  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const result = await updateTaiKhoan(data);
      setServerStatusCode(result.statusCode);
      if (result?.statusCode !== 200) {
        setServerMessage(result.message);
      } else {
        setServerMessage('Cập nhật thành công!');
      }
    } catch (error: any) {
      setServerMessage('Đã xảy ra lỗi khi cập nhật tài khoản.');
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto">
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl mx-auto ">
        <Form {...form}>
          <h1 className='font-bold text-2xl text-center'>Cài đặt tài khoản</h1>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 bg-white dark:bg-muted p-6 rounded-lg shadow-md"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giới tính</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className='flex justify-center items-center'>
                        <FormControl>
                          <RadioGroupItem value="1" id="male" />
                        </FormControl>
                        <FormLabel htmlFor="male">Nam</FormLabel>
                      </FormItem>
                      <FormItem className='flex justify-center items-center'>
                        <FormControl>
                          <RadioGroupItem value="0" id="female" />
                        </FormControl>
                        <FormLabel htmlFor="female">Nữ</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày sinh</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className='w-fit' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {
              !form.formState.isSubmitting && serverMessage && serverStatusCode !== 200 &&
              <span className='text-destructive'>{serverMessage}</span>
            }
            {
              !form.formState.isSubmitting && serverMessage && serverStatusCode === 200 &&
              <span className='text-primary'>{serverMessage}</span>
            }
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
              )}
              Lưu thay đổi
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
