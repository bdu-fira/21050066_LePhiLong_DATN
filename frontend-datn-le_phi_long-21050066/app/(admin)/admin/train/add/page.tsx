'use client'
import { Button } from "@/components/ui/button";
import FormCreateExercise from "@/features/train/forms/formTaoBaitap";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddExercisePage() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <Button onClick={()=>router.back()}><ArrowLeft/> Quay lại</Button>
      <div className="container justify-shadow">
        <FormCreateExercise />
      </div>
    </div>
  );
}