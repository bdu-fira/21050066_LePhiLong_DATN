'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formTaoBaitapSchema } from "../schemas/formTaoBaitapSchema";
import { createExercise } from "../api/createExercise";
import { MUSCLE_GROUPS } from "@/constants";

export default function FormTaoBaitap() {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const form: any = useForm<any>({
    resolver: zodResolver(formTaoBaitapSchema),
    defaultValues: { name: "", minAge: "", maxAge: "", calo: 0.1, muscles: [] }, // ✅ thêm muscles
  });

  const selectedIds: number[] = form.watch('muscles') || [];

  const onSubmit = async (values: any) => {
    setServerMessage(null);

    const payload: any = {
      name: values?.name?.trim() || "",
      minAge: Number(values?.minAge),
      maxAge: Number(values?.maxAge),
      calo: Number(values?.calo),
      muscles: Array.isArray(values?.muscles) ? values.muscles : [], // ✅ gửi nhóm cơ
    };

    const res: any = await createExercise(payload);
    setServerMessage(res?.message);

    if (res?.statusCode === 201 || res?.statusCode === 200) {
      router.push(`/admin/train/${res.data.id}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-muted p-6 rounded-lg">
        <h2 className="px-2 underline text-primary font-bold text-lg">Thêm bài tập</h2>

        <FormField
          control={form.control}
          name="name"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>Tên bài tập</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên bài tập..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="minAge"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Tuổi tối thiểu</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="15" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxAge"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Tuổi tối đa</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="calo"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Calo (0.01 – 1)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min={0.01} max={1} placeholder="0.10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <div className="font-semibold mb-1">Nhóm cơ (chọn ≥ 1)</div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {MUSCLE_GROUPS.map((g) => {
              const id = `mg_${g.id}`;
              const checked = selectedIds.includes(g.id);
              return (
                <label
                  key={g.id}
                  htmlFor={id}
                  className={`px-3 py-1 rounded border cursor-pointer select-none ${
                    checked ? 'bg-green-700 text-white' : 'bg-white'
                  }`}
                >
                  <input
                    id={id}
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={(e) => {
                      const cur = new Set<number>(form.getValues('muscles') || []);
                      e.target.checked ? cur.add(g.id) : cur.delete(g.id);
                      form.setValue('muscles', Array.from(cur), {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                  {g.name}
                </label>
              );
            })}
          </div>
          {form.formState.errors.muscles && (
            <div className="text-destructive text-sm mt-1">
              {form.formState.errors.muscles.message as string}
            </div>
          )}
        </div>

        {serverMessage && !form.formState.isSubmitting && (
          <span className="text-destructive">{serverMessage}</span>
        )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
          )}
          Thêm bài tập
        </Button>
      </form>
    </Form>
  );
}
