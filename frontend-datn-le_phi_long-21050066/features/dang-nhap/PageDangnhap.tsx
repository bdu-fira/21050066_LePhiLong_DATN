'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { useForm, SubmitHandler } from "react-hook-form"
import { DangnhapSchema, TDangnhap } from './schemas/DangnhapSchema'
import { zodResolver } from "@hookform/resolvers/zod"
import axios from 'axios'

const PageDangnhap = () => {
    const [serverMessage, setServerMessage] = useState<string>()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<TDangnhap>({ resolver: zodResolver(DangnhapSchema) })

    const onSubmit: SubmitHandler<TDangnhap> = async (data) => {
        setServerMessage('')
        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/login`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            )
            if (res.data?.isSuccess) {
                const userObj = JSON.stringify(res.data.data.user)
                localStorage.setItem('user', userObj);
                document.cookie = `user=${encodeURIComponent(JSON.stringify(userObj))}; path=/;`;
                window.location.replace('/')
            } else {
                setServerMessage(res.data?.message || 'Đăng nhập thất bại!')
            }
        } catch (error: any) {
            setServerMessage(
                error?.response?.data?.message || 'Đăng nhập thất bại!'
            )
        }
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)} className='justify-shadow flex flex-col gap-4 bg-white p-8 rounded-lg max-w-md w-full'>
            <div className='flex flex-col gap-2'>
                <label>Email <span className='text-destructive'>*</span></label>
                <Input type='email' {...register("email")} />
                {errors.email && <span className='text-destructive'>{errors.email.message}</span>}
            </div>
            <div className='flex flex-col gap-2'>
                <label>Mật khẩu <span className='text-destructive'>*</span></label>
                <Input type='password' {...register("password")} />
                {errors.password && <span className='text-destructive'>{errors.password.message}</span>}
            </div>
            <span className='text-destructive'>{serverMessage}</span>
            <div className='flex flex-col gap-2'>
                <Button type='submit' disabled={isSubmitting}>
                    {
                        isSubmitting &&
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
                    }
                    Đăng nhập
                </Button>
            </div>
        </form>
    )
}

export default PageDangnhap
