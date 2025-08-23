export default function WorkoutPlanSection({ userPlan }: any) {
    // Data mẫu, bạn có thể thay thế bằng props hoặc data fetch từ API
    const muscleGroups = [
      { name: "Ngực", icon: "💪" },
      { name: "Lưng", icon: "🏋️‍♂️" },
      { name: "Chân", icon: "🦵" },
      { name: "Vai", icon: "🏋️" },
      { name: "Tay", icon: "👐" },
      { name: "Bụng/Core", icon: "🤸" },
    ];
  
    // Giả sử mục tiêu từ props hoặc context
    const goal = userPlan?.goal || "Tăng cơ & Giảm mỡ";
  
    return (
      <section className="bg-white shadow-md border rounded-2xl max-w-2xl mx-auto px-8 py-7">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-orange-500 text-2xl">📋</span>
          <h2 className="text-xl font-bold text-primary">Kế hoạch luyện tập</h2>
        </div>
  
        <div className="mb-6">
          <div className="font-semibold text-gray-700 mb-2">Nhóm cơ tập trung:</div>
          <div className="flex flex-wrap gap-3">
            {muscleGroups.map((g) => (
              <div key={g.name} className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1 text-orange-600 font-semibold text-sm shadow-sm">
                <span>{g.icon}</span>
                <span>{g.name}</span>
              </div>
            ))}
          </div>
        </div>
  
        <div>
          <div className="font-semibold text-gray-700 mb-2">Mục tiêu hiện tại:</div>
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg font-semibold inline-block shadow-sm">
            {goal}
          </div>
        </div>
      </section>
    );
  }
  