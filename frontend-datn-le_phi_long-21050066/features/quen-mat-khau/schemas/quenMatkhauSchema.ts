import { z } from 'zod'

export const quenMatkhauSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
})
