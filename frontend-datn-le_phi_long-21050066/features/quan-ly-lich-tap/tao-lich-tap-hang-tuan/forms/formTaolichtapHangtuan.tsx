'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

import {
  createLichtapHangtuanSchema,
  type CreateLichtapHangtuanForm,
} from '@/features/quan-ly-lich-tap/tao-lich-tap-hang-tuan/schemas/CreateLichtapHangtuanSchema';

import { createLichtapHangtuan } from '@/features/quan-ly-lich-tap/tao-lich-tap-hang-tuan/api/createLichtapHangtuan';
import { MUSCLE_GROUPS } from '@/constants';
import { GOALS } from '@/constants';

export default function FormTaolichtapHangtuan() {
  const router = useRouter();
  const [serverStatusCode, setServerStatusCode] = useState<number>();
  const [serverMessage, setServerMessage] = useState<string>();

  const form = useForm<CreateLichtapHangtuanForm>({
    resolver: zodResolver(createLichtapHangtuanSchema),
    defaultValues: {
      dateOfBirth: '',
      gender: '0',
      height: undefined,
      weight: undefined,
      goal: undefined,
      muscles: [], // mảng id của MUSCLE_GROUPS
      daysPerWeek: 3,
    },
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const current_user = JSON.parse(user);
      current_user.gender = current_user.gender.toString();
      const dateOfBirth = new Date(current_user.dateOfBirth);
      current_user.dateOfBirth = dateOfBirth.toISOString().slice(0, 10);
      form.reset({
        gender: current_user.gender.toString() || '1',
        dateOfBirth: current_user.dateOfBirth
          ? new Date(current_user.dateOfBirth).toISOString().slice(0, 10)
          : '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: CreateLichtapHangtuanForm) => {
    setServerMessage(undefined);
    setServerStatusCode(undefined);

    const result = await createLichtapHangtuan(data);
    setServerStatusCode(result?.statusCode);

    if (result?.statusCode === 422 && result?.errors) {
      Object.entries(result.errors as Record<string, string>).forEach(([k, v]) => {
        form.setError(k as keyof CreateLichtapHangtuanForm, { message: String(v) });
      });
      return;
    }

    if (result?.statusCode === 200) {
      setServerMessage(result.message || 'Tạo lịch tập thành công.');
      router.push('/');
      return;
    }

    setServerMessage(result?.message || 'Đã xảy ra lỗi khi tạo lịch tập.');
  };

  return (
    <Form {...form}>
      <form
        autoComplete="off"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 bg-white dark:bg-muted p-6 rounded-lg justify-shadow"
      >
        <h2 className="px-2 underline text-primary font-bold text-lg">
          Tạo lịch tập hàng tuần
        </h2>

        {/* Ngày sinh */}
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ngày sinh</FormLabel>
              <FormControl>
                <Input type="date" className="w-fit" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Giới tính */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giới tính</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={(v) => field.onChange(v)}
                  className="flex gap-4"
                >
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <RadioGroupItem value="1" id="male" />
                    </FormControl>
                    <FormLabel htmlFor="male" data-is-radio>
                      Nam
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <RadioGroupItem value="0" id="female" />
                    </FormControl>
                    <FormLabel htmlFor="female" data-is-radio>
                      Nữ
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Chiều cao */}
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chiều cao (cm)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Ví dụ: 170"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === '' ? undefined : Number(v));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cân nặng */}
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cân nặng (kg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Ví dụ: 65"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === '' ? undefined : Number(v));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mục tiêu */}
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mục tiêu</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value != null ? String(field.value) : ''}
                  onValueChange={(v) => field.onChange(Number(v))}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                >
                  {GOALS.map((g) => (
                    <FormItem key={g.id} className="flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value={String(g.id)} id={`goal-${g.id}`} />
                      </FormControl>
                      <FormLabel htmlFor={`goal-${g.id}`} data-is-radio>
                        {g.name}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nhóm cơ (dùng MUSCLE_GROUPS) */}
        <FormField
          control={form.control}
          name="muscles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nhóm cơ</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MUSCLE_GROUPS.map((g) => {
                  const checked = (field.value ?? []).includes(g.id);
                  return (
                    <label key={g.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const val = g.id;
                          if (v) {
                            field.onChange([...(field.value || []), val]);
                          } else {
                            field.onChange((field.value || []).filter((x: number) => x !== val));
                          }
                        }}
                      />
                      <span>{g.name}</span>
                    </label>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Số ngày/tuần */}
        <FormField
          control={form.control}
          name="daysPerWeek"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số ngày tập mỗi tuần</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={7}
                  placeholder="1 - 7"
                  className="w-32"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === '' ? undefined : Number(v));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Thông báo lỗi/thành công toàn cục */}
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
          Gửi
        </Button>
      </form>
    </Form>
  );
}
