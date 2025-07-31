'use client';
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { dangkySchema } from '../schemas/DangkySchema';
import { createTaikhoan } from '../api/register';

type FormData = z.infer<typeof dangkySchema>;

export default function FormDangKy() {
  const [serverStatusCode, setServerStatusCode] = useState<number>()
  const [serverMessage, setServerMessage] = useState<string>()
  const accountForm = useForm<FormData>({
    resolver: zodResolver(dangkySchema),
    defaultValues: {
      name: '',
      gender: "1",
      dateOfBirth: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await createTaikhoan(data);
      setServerStatusCode(result.statusCode);
      if (result?.statusCode === 200) {
        setServerMessage('Tạo tài khoản thành công!');
      } else {
        setServerMessage(result.message);
      }
    } catch (error: any) {
      setServerMessage('Đã xảy ra lỗi khi cập nhật tài khoản.');
    }
  };

  return (
    <Form {...accountForm}>
      <form
        autoComplete="off"
        onSubmit={accountForm.handleSubmit(onSubmit)}
        className="space-y-6 bg-white dark:bg-muted p-6 rounded-lg justify-shadow"
      >
        <FormField
          control={accountForm.control}
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
          control={accountForm.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giới tính</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-2"
                >
                  <FormItem className='flex justify-center items-center gap-0'>
                    <FormControl>
                      <RadioGroupItem value="1" id="male" />
                    </FormControl>
                    <FormLabel htmlFor="male" data-is-radio={true} >Nam</FormLabel>
                  </FormItem>
                  <FormItem className='flex justify-center items-center gap-0'>
                    <FormControl>
                      <RadioGroupItem value="0" id="female" />
                    </FormControl>
                    <FormLabel htmlFor="female" data-is-radio={true}>Nữ</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={accountForm.control}
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
          control={accountForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} name={`email_${Date.now()}`} autoComplete='off'/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={accountForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <Input type="password" {...field} name={`password_${Date.now()}`}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={accountForm.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nhập lại mật khẩu</FormLabel>
              <FormControl>
                <Input type="password" {...field} name={`confirmPassword_${Date.now()}`}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {
          !accountForm.formState.isSubmitting && serverMessage && serverStatusCode !== 200 &&
          <span className='text-destructive'>{serverMessage}</span>
        }
        {
          !accountForm.formState.isSubmitting && serverMessage && serverStatusCode === 200 &&
          <span className='text-primary'>{serverMessage}</span>
        }
        <Button type="submit" className="w-full" disabled={accountForm.formState.isSubmitting}>
          {accountForm.formState.isSubmitting && (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
          )}
          Đăng ký
        </Button>
      </form>
    </Form>
  );
}
