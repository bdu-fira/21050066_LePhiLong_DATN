import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Flame, Repeat2, RotateCcw } from "lucide-react"

import React from 'react'

const ListSection = (props: any) => {
  return (
    <div className='flex flex-col gap-4 mt-10'>
      {
        props.listBaiTap.map((data: any, idx: number)=>(
          <Card key={data.id}>
            <CardHeader>
              <CardTitle className="bg-primary px-4 py-2 block w-fit text-white rounded-full">{data.name}</CardTitle>
              <CardDescription className="text-white px-4 py-1 block bg-black w-fit rounded-full">{data.desc}</CardDescription>
              <CardAction>
                <p className="bg-primary text-white text-4xl border-2 w-[50px] h-[50px] text-center rounded-full flex items-center justify-center border-primary">{idx + 1}</p>
              </CardAction>
              <hr/>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-1">
                <Flame color="var(--primary)" />
                <p>Số calo: {data.calo} k/cal</p>
              </div>
              <div className="flex gap-1">
                <RotateCcw color="var(--primary)" />
                <p>Số set: {data.set} set</p>
              </div>
              <div className="flex gap-1">
                <Repeat2 color="var(--primary)" />
                <p>Số rep: {data.rep} rep</p>
              </div>
            </CardContent>
        </Card>
        ))
      }
      
    </div>
  )
}

export default ListSection