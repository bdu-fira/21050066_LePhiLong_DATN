'use client'
import { Geist, Geist_Mono } from "next/font/google";
import "@/components/style/globals.css"
import { BarChart3, ChevronDown, Cog, Dumbbell, Home, PlaySquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import Link from "next/link";
import CheckAuthWrapper from "@/components/checkAuthWrapper";
import { logout } from "@/features/tai-khoan/api/logout";

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
  const [user, setUser] = useState<{ name?: string } | null>(null);
  
  useEffect(() => {
    // Lấy user mỗi khi component mount
    const user = localStorage.getItem('user');
    if(user){
      setUser(JSON.parse(user));
    }

    // Nghe event storage để tự động cập nhật khi localStorage thay đổi khi cập nhật tài khoản
    const onUserUpdated = () => {
      const user = localStorage.getItem('user');
      if(user){
        setUser(JSON.parse(user));
      }
    };

    window.addEventListener('userUpdated', onUserUpdated);

    return () => window.removeEventListener('userUpdated', onUserUpdated);
  }, []);

  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased clearfix flex flex-col min-h-screen`}
      >
        <CheckAuthWrapper>
        <header className="border-b bg-background/95 sticky top-0 z-30">
          <div className="px-4 mx-auto flex h-16 items-center justify-between">
            <div className="text-2xl font-bold text-primary tracking-tight">
              AI Fitness
            </div>
            <nav className="flex items-center gap-6 text-sm absolute left-[50%] translate-x-[-50%]">
              <a href="/" className="flex gap-2 font-medium transition-colors hover:text-primary/80 whitespace-nowrap"><Home className="w-5 h-5" /> Trang chủ</a>
              <a href="/xem-dong-tac" className="flex gap-2 font-medium transition-colors hover:text-primary/80 whitespace-nowrap"><PlaySquare className="w-5 h-5" />Xem động tác</a>
            </nav>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 px-4 py-2 ml-4 rounded-md border font-medium bg-background hover:bg-accent transition-colors"
                  type="button"
                >
                  {user?.name || "Đang tải..."}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href={"/tai-khoan"}>
                    Cài đặt
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild><button className="text-destructive w-full bg-transparent text-left hover:text-destructive" onClick={()=>logout()}>Đăng xuất</button></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="container-lg flex-1 flex">
          {children}
        </main>
        </CheckAuthWrapper>
      </body>
    </html>
  );
}
