'use client';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteExercise } from '../api/deleteExercise';

export default function FormXoaBaitap(props: any) {
  const [serverStatusCode, setServerStatusCode] = useState<number>()
  const [serverMessage, setServerMessage] = useState<string>()

  const form = useForm({
    defaultValues: {},
  })

  const onSubmit = async () => {
    try {
      const payload = {
        id: props.open
      }
      const result = await deleteExercise(payload);
      setServerStatusCode(result?.statusCode);
      if (result?.statusCode === 200) {
        setServerMessage('Xóa thành công!');
        props.refetch()
        props.setOpen()

      } else {
        setServerMessage(result?.message || 'Không thể xóa.');
      }
    } catch (error: any) {
      setServerMessage('Đã xảy ra lỗi khi xóa bài tập.');
    }
  };

  return (
    <Dialog open={props.open}>
      <DialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 bg-white dark:bg-muted rounded-lg"
          >
            <DialogHeader>
              <DialogTitle>Xóa bài tập</DialogTitle>
              <DialogDescription>
                Bạn có chắc muốn xóa bài tập? Thao tác này không thể hoàn trả.
              </DialogDescription>
            </DialogHeader>

            {
              !form.formState.isSubmitting && serverMessage && serverStatusCode !== 200 &&
              <span className='text-destructive'>{serverMessage}</span>
            }
            {
              !form.formState.isSubmitting && serverMessage && serverStatusCode === 200 &&
              <span className='text-primary'>{serverMessage}</span>
            }

            <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={props.setOpen}>
                  Hủy
                </Button>
              </DialogClose>

              <Button type="submit" variant="destructive" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
                )}
                Đồng ý
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
