import FormRalenhGiamsatTapluyen from "@/features/giam-sat-tap-luyen/tap-luyen/forms/formRalenhGiamsatTapluyen";

export default async function PageRalenhGiamsatTapluyen({params} : {
  params: Promise<{ date: string }>
}) {
  const {date} = await params

  return <FormRalenhGiamsatTapluyen date={date} />;
}
