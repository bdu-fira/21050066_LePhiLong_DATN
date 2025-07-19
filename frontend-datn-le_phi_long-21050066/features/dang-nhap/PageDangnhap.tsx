'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React from 'react'
import { useForm, SubmitHandler } from "react-hook-form"
import { DangnhapSchema, TDangnhap } from './schemas/DangnhapSchema'
import { zodResolver } from "@hookform/resolvers/zod"


const PageDangnhap = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TDangnhap>({ resolver: zodResolver(DangnhapSchema) })

    const onSubmit: SubmitHandler<TDangnhap> = (data) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='justify-shadow flex flex-col gap-4 bg-white p-8 rounded-lg max-w-md w-full'>
        <div className='flex flex-col gap-2'>
            <label>Email <span className='text-destructive'>*</span></label>
            <Input type='email' defaultValue="test" {...register("email")}/>
            {errors.email && <span className='text-destructive'>{errors.email.message}</span>}
        </div>
        <div className='flex flex-col gap-2'>
            <label>Mật khẩu <span className='text-destructive'>*</span></label>
            <Input type='password' defaultValue="test" {...register("password")}/>
            {errors.password && <span className='text-destructive'>{errors.password.message}</span>}
        </div>
        <div className='flex flex-col gap-2'>
            <Button type='submit'>Đăng nhập</Button>
        </div>
    </form>
  )
}

export default PageDangnhap