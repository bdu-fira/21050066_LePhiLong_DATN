type MonitorSectionProps = {
  reps: number;
  errors: number;
  feedback?: string;
};

export default function MonitorSection({ reps, errors, feedback }: MonitorSectionProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-center gap-2 items-center">
        <p className="text-lg border-b-2 px-4 py-2 block w-fit">Số rep đúng</p>
        <p className="text-orange-500 text-center text-6xl">{reps}</p>
        <p className="text-lg border-b-2 px-4 py-2 block w-fit mt-6">Số lần lỗi</p>
        <p className="text-orange-500 text-center text-6xl">{errors}</p>
        {feedback && (
          <div className={`mt-4 text-lg ${feedback.includes('ĐÚNG') ? 'text-green-500' : 'text-red-400'}`}>
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}
