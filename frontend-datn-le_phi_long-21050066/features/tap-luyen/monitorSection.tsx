// components/MonitorSection.tsx
type MonitorSectionProps = {
    reps: number;
    // Bạn có thể thêm các props khác nếu cần
  };
  
  export default function MonitorSection({ reps }: MonitorSectionProps) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col justify-center gap-2 items-center">
          <p className="text-lg border-b-2 px-4 py-2 block w-fit">Số rep</p>
          <p className="text-orange-500 text-center text-6xl">{reps} / 10</p>
        </div>
      </div>
    );
  }
  