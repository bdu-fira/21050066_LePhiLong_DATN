"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Flame,
  ListTodo,
  Info,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  CalendarPlus,
  TrendingUp,
  Trash2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getSchedule } from "../api/getSchedule"
import { deleteSchedule } from "../api/deleteSchedule"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

const reload = () => {
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

export default function FormLichtap() {
  const router = useRouter()
  const [s, setS] = useState<any>({ weeks: [], weekIdx: 0, dayIdx: 0, loading: false, msg: "", code: undefined })
  const [deleting, setDeleting] = useState(false)
  const [deleteMsg, setDeleteMsg] = useState("")

  useEffect(() => {
    ; (async () => {
      try {
        setS((x: any) => ({ ...x, loading: true }))
        const r = await getSchedule()
        setS({ weeks: r?.data?.weeks || [], weekIdx: 0, dayIdx: 0, loading: false, msg: r?.message || "", code: r?.statusCode })
      } catch (e: any) {
        setS({ weeks: [], weekIdx: 0, dayIdx: 0, loading: false, msg: e?.message || "Không thể tải lịch tập.", code: 500 })
      }
    })()
  }, [])

  const f2 = (n: any) => Number(n || 0).toFixed(2)

  const has = s.weeks.length > 0
  const days = has ? s.weeks[s.weekIdx]?.days || [] : []
  const sel = days[s.dayIdx] || null
  const totalCal = days.reduce((a: any, b: any) => a + (b?.calories || 0), 0)
  const totalEx = days.reduce((a: any, b: any) => a + (b?.exercises || 0), 0)

  const hasWorkout = !!(sel && Number(sel.exercises) > 0)
  console.log(sel)


  const groups = (() => {
    const g = sel?.groups
    if (Array.isArray(g) && g.length) return g
    const arr = sel?.details
    if (!Array.isArray(arr) || !arr.length) return []
    const m: any = {}
    for (const x of arr) {
      const name = x?.exercise?.name || x?.exerciseName || String(x?.exerciseId)
      const cal = (Number(x?.exercise?.calo) || 0) * (Number(x?.set) || 0) * (Number(x?.rep) || 0)
      m[name] = (m[name] || 0) + cal
    }
    return Object.keys(m).map(k => ({ name: k, calories: m[k] })).sort((a: any, b: any) => b.calories - a.calories)
  })()

  const prev = () => has && s.weekIdx > 0 && setS((x: any) => ({ ...x, weekIdx: x.weekIdx - 1, dayIdx: 0 }))
  const next = () => has && s.weekIdx < s.weeks.length - 1 && setS((x: any) => ({ ...x, weekIdx: x.weekIdx + 1, dayIdx: 0 }))

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteMsg("")
    try {
      const r = await deleteSchedule()
      console.log("deleteSchedule ->", r)
      if (r?.isSuccess) {
        setDeleteMsg(r.message)
        reload()
      } else {
        setDeleteMsg(r?.message || "Xóa thất bại.")
      }
    } catch (e: any) {
      setDeleteMsg(e?.message || "Xóa thất bại.")
    }
    setDeleting(false)
  }

  if (!s.loading && !has) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto flex flex-col gap-8 px-6 py-16 items-start max-w-4xl w-full">
          <div className="bg-white shadow-lg border rounded-2xl p-10 w-full text-center">
            <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-muted">
              <CalendarPlus className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Bạn chưa có lịch tập</h2>
            {s.msg ? <p className="text-sm text-muted-foreground mb-6">{s.msg}</p> : null}
            <Button size="lg" className="font-semibold bg-orange-500 hover:bg-orange-600 text-white" onClick={() => router.push("/tao-lich-tap-hang-tuan")}>
              <CalendarPlus className="mr-2 w-5 h-5" />
              Tạo lịch tập
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex flex-col gap-8 px-6 py-10 items-start">
        <div className="flex-[1.1] min-w-[380px] max-w-[800px]">
          <div className="bg-white shadow-lg border rounded-2xl p-8 w-full space-y-7">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={prev} disabled={s.weekIdx <= 0 || !has}><ChevronLeft /></Button>
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold text-primary tracking-tight">
                  {s.loading ? "Đang tải lịch luyện tập..." : `Lịch luyện tập - ${s.weeks[s.weekIdx]?.weekLabel ?? "—"}`}
                </h2>
              </div>
              <Button variant="ghost" onClick={next} disabled={!has || s.weekIdx >= s.weeks.length - 1}><ChevronRight /></Button>
            </div>

            {!s.loading && s.msg && s.code !== 200 ? <div className="text-sm text-destructive">{s.msg}</div> : null}

            <div className="flex gap-2 mb-1 overflow-x-auto px-1">
              {days.length ? (
                days.map((d: any, i: number) => (
                  <Button
                    key={d.date}
                    size="sm"
                    variant={s.dayIdx === i ? "default" : "ghost"}
                    className={`shrink-0 rounded-full px-0 w-16 h-11 text-sm font-bold transition-all duration-150 border-2 ${s.dayIdx === i
                      ? "bg-orange-500 text-white shadow border-orange-500"
                      : "hover:bg-orange-100 text-orange-700 border-transparent"
                      }`}
                    onClick={() => setS((x: any) => ({ ...x, dayIdx: i }))}
                    title={d.date}
                  >
                    {formatVN(d.date)}
                  </Button>
                ))
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <RefreshCcw className="w-4 h-4" />
                  {s.loading ? "Đang tải..." : "Không có dữ liệu tuần."}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/80 rounded-lg px-4 py-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span>Hiển thị tổng số động tác và tổng kcal dự kiến của từng ngày.</span>
            </div>

            <div className="grid grid-cols-2 gap-5 py-2">
              <SummaryItem icon={<ListTodo className="w-6 h-6 text-violet-500" />} label="Động tác (ngày)" value={sel ? sel.exercises : 0} />
              <SummaryItem icon={<Flame className="w-6 h-6 text-orange-500" />} label="Kcal (ngày)" value={sel ? f2(sel.calories) : 0} />
            </div>

            {groups.length ? (
              <div className="rounded-lg border p-3">
                <div className="text-sm font-semibold mb-2">Kcal theo động tác (ngày)</div>
                <div className="space-y-2">
                  {groups.slice(0, 8).map((g: any) => (
                    <div key={g.name} className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[70%]">{g.name}</span>
                      <span className="font-semibold">{f2(g.calories)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex gap-3">
              <Button size="lg" disabled={!hasWorkout} className="flex-1 font-bold text-lg text-white shadow bg-orange-500 hover:bg-orange-600 transition-all" onClick={() => router.push(`/tap-luyen/${sel.date}`)}>
                <TrendingUp className="mr-2 w-6 h-6" />
                Bắt đầu luyện tập
              </Button>
            </div>

            <div className="flex gap-3">
              <Button size="lg" variant="secondary" className="font-semibold" onClick={() => router.push("/dieu-chinh-lich-tap")}>
                <CalendarPlus className="mr-2 w-5 h-5" />
                Điều chỉnh lịch tập
              </Button>

              {/* Nút xoá với Dialog thường */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="destructive" className="font-semibold">
                    <Trash2 className="mr-2 w-5 h-5" />
                    Xóa lịch tập
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bạn có chắc muốn xóa lịch tập?</DialogTitle>
                    <DialogDescription>
                      Hành động này sẽ đánh dấu lịch tập hiện tại là không còn hiệu lực (isTraining = 0).
                    </DialogDescription>
                  </DialogHeader>
                  {deleteMsg && <div className="text-sm text-destructive">{deleteMsg}</div>}
                  <DialogFooter>
                    {/* Nút Hủy đóng dialog */}
                    <DialogClose asChild>
                      <Button variant="outline">Hủy</Button>
                    </DialogClose>

                    {/* Nút Xác nhận */}
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        await handleDelete()
                        if (deleteMsg.includes("thành công")) {
                          reload()
                        }
                      }}
                      disabled={deleting}
                    >
                      {deleting ? "Đang xóa..." : "Xác nhận"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

            </div>

            <div className="w-full h-px bg-gray-200 my-1" />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-orange-600 text-lg">Tổng hợp {s.weeks[s.weekIdx]?.weekLabel ?? "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <SummaryItem icon={<ListTodo className="w-6 h-6 text-violet-600" />} label="Tổng động tác (tuần)" value={f2(totalEx)} />
                <SummaryItem icon={<Flame className="w-6 h-6 text-orange-500" />} label="Tổng Kcal (tuần)" value={f2(totalCal)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryItem({ icon, label, value }: any) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-muted/70 p-3 shadow-sm min-h-[70px]">
      {icon}
      <div className="text-xs font-medium text-muted-foreground mt-1">{label}</div>
      <div className="text-xl font-bold text-primary">{value}</div>
    </div>
  )
}

function formatVN(s: any) {
  const [y, m, d] = String(s).split("-").map((x: any) => Number(x))
  const pad = (n: any) => String(n).padStart(2, "0")
  return `${pad(d)}/${pad(m)}`
}
