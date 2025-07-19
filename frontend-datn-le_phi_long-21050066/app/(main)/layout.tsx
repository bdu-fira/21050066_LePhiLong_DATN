import { Geist, Geist_Mono } from "next/font/google";
import "@/components/style/globals.css"
import { BarChart3, ChevronDown, Dumbbell, Home, PlaySquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <script src="/mediapipe/pose/pose.js"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased clearfix flex flex-col min-h-screen gap-4`}
      >
        <header className="border-b bg-background/95 sticky top-0 z-30">
          <div className="px-4 mx-auto flex h-16 items-center justify-between">
            <div className="text-2xl font-bold text-primary tracking-tight">
              AI Fitness
            </div>
            <nav className="flex items-center gap-6 text-sm absolute left-[50%] translate-x-[-50%]">
              <a href="/" className="flex gap-2 font-medium transition-colors hover:text-primary/80 whitespace-nowrap"><Home className="w-5 h-5" /> Trang chủ</a>
              <a href="#" className="flex gap-2 font-medium transition-colors hover:text-primary/80 whitespace-nowrap"><PlaySquare className="w-5 h-5" />Xem động tác</a>
              <a href="#" className="flex gap-2 font-medium transition-colors hover:text-primary/80 whitespace-nowrap"><BarChart3 className="w-5 h-5" />Phân tích</a>
            </nav>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 px-4 py-2 ml-4 rounded-md border font-medium bg-background hover:bg-accent transition-colors"
                  type="button"
                >
                  Nguyễn Văn A
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
                <DropdownMenuItem>Cài đặt</DropdownMenuItem>
                <DropdownMenuItem><a className="text-destructive w-full" href="/dang-nhap">Đăng xuất</a></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="container-lg flex-1 flex mt-4">
          {children}
        </main>
      </body>
    </html>
  );
}
