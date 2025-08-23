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
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if(user){
      setUser(JSON.parse(user));
    }

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}>
        <CheckAuthWrapper>
          <div className="flex h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r flex flex-col justify-between min-h-screen">
              <div>
                <div className="flex items-center gap-2 px-6 py-4 border-b">
                  <Dumbbell className="w-6 h-6 text-primary" />
                  <span className="text-xl font-bold tracking-tight text-primary">AI Fitness</span>
                </div>
                <nav className="flex flex-col gap-1 mt-4 px-2">
                  <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:bg-accent transition-colors">
                    <Home className="w-5 h-5" /> Dashboard
                  </Link>
                  <Link href="/admin/train" className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:bg-accent transition-colors">
                    <Cog className="w-5 h-5" /> Huấn luyện động tác
                  </Link>
                </nav>
              </div>
              {/* User section dưới sidebar */}
              <div className="px-4 py-4 border-t">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 w-full px-4 py-2 rounded-md border font-medium bg-background hover:bg-accent transition-colors"
                      type="button"
                    >
                      {user?.name || "Đang tải..."}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    <DropdownMenuItem asChild>
                      <Link href={"/tai-khoan"}>Cài đặt</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button className="text-destructive w-full bg-transparent text-left hover:text-destructive" onClick={() => logout()}>Đăng xuất</button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </aside>
            {/* Content */}
            <main className="flex-1 p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </CheckAuthWrapper>
      </body>
    </html>
  );
}
