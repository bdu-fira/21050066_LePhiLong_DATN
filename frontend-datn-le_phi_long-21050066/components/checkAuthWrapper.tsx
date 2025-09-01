// pages/CheckAuthWrapper.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";

export default function CheckAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/verify`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    )
    .then((res) => {
      const isAdmin = res.data.data === 1;
      const isAdminPath = pathname.startsWith('/admin');

      if (isAdmin && !isAdminPath) {
        router.replace('/admin/dashboard');
      } 
      else if (!isAdmin && isAdminPath) {
        console.log(isAdmin, isAdminPath)
        router.replace('/');
      } 
      setIsChecking(false);
      
    })
    .catch(() => {
      router.replace('/dang-nhap');
    });
  }, [router, pathname]);
  
  return !isChecking && children;
}