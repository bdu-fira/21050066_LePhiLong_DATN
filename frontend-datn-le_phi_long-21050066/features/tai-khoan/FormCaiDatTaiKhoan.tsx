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
import { thongtinTaikhoanSchema } from '@/features/tai-khoan/schemas/thongtinTaikhoanSchema';
import { updateTaiKhoan } from '@/features/tai-khoan/api/update';
import { useEffect, useState } from 'react';

type FormData = z.infer<typeof thongtinTaikhoanSchema>;

export default function FormCaiDatTaiKhoan() {
  const [serverStatusCode, setServerStatusCode] = useState<number>()
  const [serverMessage, setServerMessage] = useState<string>()
  const accountForm = useForm<FormData>({
    resolver: zodResolver(thongtinTaikhoanSchema),
    defaultValues: {
      name: '',
      gender: "1",
      dateOfBirth: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if(user){
      const current_user = JSON.parse(user);
      current_user.gender = current_user.gender.toString()
      const dateOfBirth = new Date(current_user.dateOfBirth)
      current_user.dateOfBirth = dateOfBirth.toISOString().slice(0, 10)
      accountForm.reset(current_user)
    }
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      console.log(data)
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
    <Form {...accountForm}>
      <form
        onSubmit={accountForm.handleSubmit(onSubmit)}
        className="space-y-6 bg-white dark:bg-muted p-6 rounded-lg border-t-1"
      >
        <h2 className='px-2 underline text-primary font-bold text-xl'>Thông tin tài khoản</h2>
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
                  className="flex gap-4"
                >
                  <FormItem className='flex justify-center items-center'>
                    <FormControl>
                      <RadioGroupItem value="1" id="male" />
                    </FormControl>
                    <FormLabel htmlFor="male" data-is-radio={true} >Nam</FormLabel>
                  </FormItem>
                  <FormItem className='flex justify-center items-center'>
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
                <Input type="email" {...field} />
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
                <Input type="password" {...field} />
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
          Lưu thay đổi
        </Button>
      </form>
    </Form>
  );
}
