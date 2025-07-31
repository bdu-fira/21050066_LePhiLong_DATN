'use client';
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { capnhatThongTinCaNhanSchema } from '@/features/tai-khoan/schemas/updateThongtinCanhanSchema';
import { updateThongtinCanhan } from '@/features/tai-khoan/api/updateThongtinCaNhan';
import { useEffect, useState } from 'react';

type FormData = z.infer<typeof capnhatThongTinCaNhanSchema>;

export default function FormCapNhatThongTinCaNhan() {
  const [serverStatusCode, setServerStatusCode] = useState<number>();
  const [serverMessage, setServerMessage] = useState<string>();
  const form = useForm<FormData>({
    resolver: zodResolver(capnhatThongTinCaNhanSchema),
    defaultValues: {
      weight: 0,
      height: 0,
    },
  });

  useEffect(() => {
      const user = localStorage.getItem('user');
      if(user){
        const current_trainee = JSON.parse(user).trainee;
        form.reset(current_trainee)
      }
    }, []);
  

  const onSubmit = async (data: FormData) => {
    try {
      const result = await updateThongtinCanhan(data);
      setServerStatusCode(result.statusCode);
      setServerMessage(result.message);
      if (result?.statusCode === 200) {
        localStorage.setItem('user', JSON.stringify(result.data));
        window.dispatchEvent(new Event('userUpdated'));
      }
    } catch (error: any) {
      setServerMessage('Đã xảy ra lỗi khi cập nhật.');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 bg-white dark:bg-muted p-6 rounded-lg justify-shadow"
      >
        <h2 className="px-2 underline text-primary font-bold text-lg">
          Thông tin cá nhân
        </h2>
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cân nặng (kg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Nhập cân nặng..."
                  {...field}
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  min={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chiều cao (cm)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Nhập chiều cao..."
                  {...field}
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  min={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!form.formState.isSubmitting && serverMessage && serverStatusCode !== 200 && (
          <span className="text-destructive">{serverMessage}</span>
        )}
        {!form.formState.isSubmitting && serverMessage && serverStatusCode === 200 && (
          <span className="text-primary">{serverMessage}</span>
        )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
          )}
          Lưu thay đổi
        </Button>
      </form>
    </Form>
  );
}
