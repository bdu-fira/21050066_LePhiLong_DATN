'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { formTimBaitapSchema } from "@/features/train/schemas/formTimBaitapSchema";
import { findExercises } from "@/features/train/api/findExercise";
import { MUSCLE_GROUPS } from "@/constants";
import FormXoaBaitap from "./formXoaBaitap";

const EMPTY_VALUE = '__EMPTY__';

export default function FormTimBaitap() {
  const router = useRouter();
  const [result, setResult] = useState<any[]>([]);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const form: any = useForm<any>({
    resolver: zodResolver(formTimBaitapSchema),
    defaultValues: {
      name: "",
      muscleGroupId: "",
    },
  });

  const fetchAll = async () => {
    setServerMessage(null);
    try {
      const res: any = await findExercises({});
      if (res?.statusCode === 200) {
        setResult(res?.data ?? []);
      } else {
        setResult([]);
        setServerMessage(res?.message || 'Không thể tải dữ liệu.');
      }
    } catch {
      setResult([]);
      setServerMessage('Lỗi hệ thống, vui lòng thử lại sau.');
    }
  };

  useEffect(()=>{
    fetchAll()
  }, [])

  useEffect(()=>{
    console.log(deletingId)
  }, [deletingId])



  const onSubmit = async (values: any) => {
    setServerMessage(null);

    const payload: any = {
      name: values?.name || "",
      muscleGroupId:
        values?.muscleGroupId && values.muscleGroupId !== ''
          ? Number(values.muscleGroupId)
          : undefined,
    };

    const res: any = await findExercises(payload);
    setServerMessage(res?.statusCode !== 200 && res?.message);
    setResult(res?.statusCode === 200 ? (res?.data ?? []) : []);
  };

  const onEdit = (id: number) => {
    router.push(`/admin/train/${id}`);
  };


  const muscleName = (gid: number) =>
    MUSCLE_GROUPS.find((m) => m.id === gid)?.name ?? `#${gid}`;

  return (
    <>
    <h1 className="text-4xl font-semibold mb-4">Quản lý bài tập</h1>
    <Form {...form}>
      <form
        autoComplete="off"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 bg-white dark:bg-muted p-6 rounded-lg justify-shadow"
      >
        
        <div className="flex items-center justify-between">
          <h2 className="px-2 underline text-primary font-bold text-lg">Tìm bài tập</h2>
          <Button type="button" onClick={() => router.push('/admin/train/add')} className="gap-2">
            <Plus className="h-4 w-4" /> Thêm bài tập
          </Button>
        </div>
        
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

        <FormField
          control={form.control}
          name="muscleGroupId"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>Nhóm cơ</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v === EMPTY_VALUE ? '' : v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn nhóm cơ..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_VALUE}>-- Tất cả nhóm cơ --</SelectItem>
                    {MUSCLE_GROUPS.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverMessage && !form.formState.isSubmitting && (
          <span className="text-destructive">{serverMessage}</span>
        )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
          )}
          Tìm
        </Button>

        {result?.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold">Kết quả</h3>
            <div className="divide-y rounded-md border">
              {result.map((ex: any) => (
                <div key={ex?.id} className="flex items-center justify-between p-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{ex?.name}</div>
                    {Array.isArray(ex?.muscleGroupIds) && ex.muscleGroupIds.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {ex.muscleGroupIds.map((gid: number) => (
                          <Badge key={`${ex?.id}-${gid}`} variant="secondary">
                            {muscleName(gid)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(ex?.id)}
                      className="gap-1"
                    >
                      <Pencil className="h-4 w-4" />
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingId(ex?.id)}
                      disabled={deletingId === ex?.id}
                      className="gap-1"
                    >
                      {deletingId === ex?.id ? (
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
      {
        deletingId && 
        <FormXoaBaitap open={deletingId} setOpen={()=>setDeletingId(null)} refetch={()=>fetchAll()}/>
      }
    </Form>
    </>
  );
}
