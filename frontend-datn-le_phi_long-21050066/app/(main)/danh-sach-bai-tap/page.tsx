import { Button } from '@/components/ui/button'
import ListSection from '@/features/danh-sach-bai-tap/listSection'
import React from 'react'

const listBaiTap = [
    {
        id: "bt_001",
        name: "Cuốn tạ đơn",
        desc: "Nâng hạ tạ đơn bằng một tay",
        calo: 320,
        set: 3,
        rep: 20,
    },
    {
        id: "bt_002",
        name: "Squat",
        desc: "Đứng lên ngồi xuống, hai tay chắp sau đầu",
        calo: 400,
        set: 3,
        rep: 25,
    },
    {
        id: "bt_003",
        name: "Hít đất",
        desc: "Chống đẩy bằng hai tay",
        calo: 250,
        set: 3,
        rep: 15,
    },
]

const PageDanhSachBaiTap = () => {
  return (
    <div className='mx-auto px-4 max-w-4xl container space-y-4'>
        <h1 className='text-4xl font-semibold text-center'>Danh sách bài tập</h1>
        <ListSection listBaiTap={listBaiTap} />
        <Button className='mx-auto block'>Bắt đầu luyện tập</Button>
    </div>
  )
}

export default PageDanhSachBaiTap