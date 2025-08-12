'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DieuchinhLichtapForm, RATING_VALUES, updateLichtapHangtuanSchema } from '../schemas/updateLichtapHangtuanSchema';

const RATING_LABELS: Record<number, string> = {
  1: 'Dễ (+1)',
  [-1]: 'Khó (-1)',
};

export default function FormDieuchinhLichtap({
  onSubmit,
}: {
  /** Optional: truyền hàm submit riêng để gọi API; nếu không truyền, form chỉ hiện thông báo */
  onSubmit?: (data: DieuchinhLichtapForm) => Promise<void> | void;
}) {
  const [serverMessage, setServerMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<DieuchinhLichtapForm>({
    resolver: zodResolver(updateLichtapHangtuanSchema),
    defaultValues: { rating: undefined as unknown as number },
    mode: 'onChange',
  });

  const handleSubmit = async (data: DieuchinhLichtapForm) => {
    setServerMessage(undefined);
    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      setServerMessage('Đã gửi đánh giá điều chỉnh lịch tập.');
    } catch (e: any) {
      setServerMessage(e?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
    setSubmitting(false);
  };

  return (
    <Form {...form}>
      <form
        autoComplete="off"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 bg-white dark:bg-muted p-6 rounded-lg justify-shadow"
      >
        <h2 className="px-2 underline text-primary font-bold text-lg">
          Điều chỉnh lịch tập
        </h2>

        {/* Đánh giá: Dễ (+1) / Khó (-1) */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Đánh giá</FormLabel>
              <FormControl>
                <RadioGroup
                  className="grid grid-cols-2 gap-3"
                  value={field.value != null ? String(field.value) : ''}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  {RATING_VALUES.map((v) => (
                    <FormItem key={v} className="flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value={String(v)} id={`rating-${v}`} />
                      </FormControl>
                      <FormLabel htmlFor={`rating-${v}`} data-is-radio>
                        {RATING_LABELS[v]}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Thông báo */}
        {serverMessage && (
          <div className="text-primary">{serverMessage}</div>
        )}

        {/* Nút Submit */}
        <Button type="submit" className="w-full" disabled={submitting || form.formState.isSubmitting}>
          {(submitting || form.formState.isSubmitting) && (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
          )}
          Gửi
        </Button>
      </form>
    </Form>
  );
}
