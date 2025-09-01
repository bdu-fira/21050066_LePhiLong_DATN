// app/page.tsx

import PoseSearch from "@/features/xem-dong-tac/forms/PoseSearch";
import PoseViewer3D from "@/features/xem-dong-tac/forms/poseViewer3D";


export default function Page() {
  return (
    <div className="w-full px-2">
      <PoseSearch />
    </div>
  );
}