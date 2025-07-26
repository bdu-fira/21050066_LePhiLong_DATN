import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function CheckAuthWrapper({ children }: any) {
  const router = useRouter();
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
      setIsChecking(false)
    })
    .catch((err) => {
      router.replace('/dang-nhap');
    });
  }, [router]);

  return !isChecking && children;
}
