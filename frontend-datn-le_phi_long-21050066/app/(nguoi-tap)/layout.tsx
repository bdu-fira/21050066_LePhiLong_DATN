'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "@/components/style/globals.css";
import { Home, PlaySquare, ChevronDown, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
}: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem("user");
    if (cached) setUser(JSON.parse(cached));

    const onUserUpdated = () => {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
    };
    window.addEventListener("userUpdated", onUserUpdated);
    return () => window.removeEventListener("userUpdated", onUserUpdated);
  }, []);

  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased clearfix flex flex-col min-h-screen`}>
        <CheckAuthWrapper>
          {/* Header responsive */}
          <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-7xl px-3 sm:px-4">
              <div className="flex h-16 items-center justify-between gap-2">
                {/* Mobile: menu trigger */}
                <div className="flex items-center gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <button
                        type="button"
                        aria-label="Mở menu"
                        className="md:hidden inline-flex items-center justify-center rounded-md border px-3 py-2 hover:bg-accent transition-colors"
                      >
                        <Menu className="h-5 w-5" />
                      </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 sm:w-80">
                      <SheetHeader className="text-left">
                        <SheetTitle className="text-base">
                          AI Fitness{user?.name ? ` — Xin chào, ${user.name}` : ""}
                        </SheetTitle>
                      </SheetHeader>
                      <nav className="mt-4 flex flex-col gap-1">
                        <Link
                          href="/"
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                        >
                          <Home className="h-5 w-5" />
                          Trang chủ
                        </Link>
                        <Link
                          href="/xem-dong-tac"
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                        >
                          <PlaySquare className="h-5 w-5" />
                          Xem động tác
                        </Link>
                      </nav>
                    </SheetContent>
                  </Sheet>

                  {/* Logo / Brand */}
                  <Link href="/" className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                    AI Fitness
                  </Link>
                </div>

                {/* Nav giữa (ẩn trên mobile, hiện từ md+) */}
                <nav className="hidden md:flex items-center gap-6 text-sm">
                  <Link
                    href="/"
                    className="flex items-center gap-2 font-medium transition-colors hover:text-primary/80 whitespace-nowrap"
                  >
                    <Home className="w-5 h-5" />
                    Trang chủ
                  </Link>
                  <Link
                    href="/xem-dong-tac"
                    className="flex items-center gap-2 font-medium transition-colors hover:text-primary/80 whitespace-nowrap"
                  >
                    <PlaySquare className="w-5 h-5" />
                    Xem động tác
                  </Link>
                </nav>

                {/* User dropdown (giữ nguyên logic) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-md border px-3 py-2 font-medium bg-background hover:bg-accent transition-colors"
                    >
                      {user?.name || "Đang tải..."}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem asChild>
                      <Link href={"/tai-khoan"}>Cài đặt</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button
                        className="text-destructive w-full bg-transparent text-left hover:text-destructive"
                        onClick={() => logout()}
                      >
                        Đăng xuất
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="container-lg flex-1 flex">{children}</main>
        </CheckAuthWrapper>
      </body>
    </html>
  );
}
