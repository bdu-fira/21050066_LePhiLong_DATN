import { headers } from "next/headers";
import FormRalenhGiamsatTapluyen from "@/features/giam-sat-tap-luyen/tap-luyen/forms/formRalenhGiamsatTapluyen";
import FormRalenhGiamsatTapluyenMobile from "@/features/giam-sat-tap-luyen/tap-luyen/forms/formRalenhGiamsatTapluyenMobile";

export default async function PageRalenhGiamsatTapluyen({
  params,
}: {
  params: { date: string };
}) {
  const { date } = await params;
  const headersList = await headers(); 
  const ua = headersList.get("user-agent") || "";
  const isMobile = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua);

  return isMobile ? (
    <FormRalenhGiamsatTapluyenMobile date={date} />
  ) : (
    <FormRalenhGiamsatTapluyen date={date} />
  );
}
