import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from 'src/entities/schedule.entity';
import { ScheduleDetail } from 'src/entities/scheduledetail.entity';
import { Exercise } from 'src/entities/exercise.entity';
import { Muscle } from 'src/entities/muscle.entity';
import { EvaluationCriteria } from 'src/entities/evaluationcriteria.entity';
import { Trainee } from 'src/entities/trainee.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule) private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(ScheduleDetail) private readonly scheduleDetailRepo: Repository<ScheduleDetail>,
    @InjectRepository(Exercise) private readonly exerciseRepo: Repository<Exercise>,
    @InjectRepository(Muscle) private readonly muscleRepo: Repository<Muscle>,
    @InjectRepository(EvaluationCriteria) private readonly evalRepo: Repository<EvaluationCriteria>,
    @InjectRepository(Trainee) private readonly traineeRepo: Repository<Trainee>,
  ) {}

  async getSchedule(payload: any) {
    try {
      const traineeID = Number(payload?.userId);

      const schedule = await this.scheduleRepo.findOne({
        where: { traineeID, isTraining: 1 },
      });
      if (!schedule) {
        return { statusCode: 200, message: 'Không có lịch tập đang hoạt động.', data: { weeks: [] } };
      }

      // lấy toàn bộ detail + exercise liên quan
      const details = await this.scheduleDetailRepo.find({
        where: { scheduleID: schedule.id },
        relations: ['exercise'],
        order: { date: 'ASC' },
      });

      if (!details.length) {
        return { statusCode: 200, message: 'Chưa có chi tiết lịch cho lịch tập hiện tại.', data: { weeks: [] } };
      }

      // group theo ngày
      const dayMap: Record<string, { exercises: number; calories: number }> = {};
      for (const d of details) {
        if (!dayMap[d.date]) dayMap[d.date] = { exercises: 0, calories: 0 };
        dayMap[d.date].exercises++;
        dayMap[d.date].calories += d.exercise?.calo || 0;
      }

      const days = Object.keys(dayMap).map(date => ({
        date,
        exercises: dayMap[date].exercises,
        calories: dayMap[date].calories,
      })).sort((a, b) => a.date.localeCompare(b.date));

      // gom thành tuần
      const parseISO = (s: string) => {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(y, m - 1, d);
      };
      const fmtVN = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      const toMonday = (d: Date) => {
        const day = (d.getDay() + 6) % 7;
        const monday = new Date(d);
        monday.setDate(d.getDate() - day);
        monday.setHours(0, 0, 0, 0);
        return monday;
      };
      const toSunday = (monday: Date) => {
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(0, 0, 0, 0);
        return sunday;
      };

      const firstDate = parseISO(days[0].date);
      const lastDate = parseISO(days[days.length - 1].date);
      let curMonday = toMonday(firstDate);
      const finalSunday = toSunday(toMonday(lastDate));

      const weeks: any[] = [];
      while (curMonday <= finalSunday) {
        const sunday = toSunday(curMonday);
        const bucket: any[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(curMonday);
          d.setDate(curMonday.getDate() + i);
          const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const found = dayMap[iso] || { exercises: 0, calories: 0 };
          bucket.push({ date: iso, exercises: found.exercises, calories: found.calories });
        }
        weeks.push({
          weekLabel: `Tuần ${weeks.length + 1} (${fmtVN(curMonday)}–${fmtVN(sunday)})`,
          startDate: `${curMonday.getFullYear()}-${String(curMonday.getMonth() + 1).padStart(2, '0')}-${String(curMonday.getDate()).padStart(2, '0')}`,
          endDate: `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`,
          days: bucket,
        });
        curMonday = new Date(sunday);
        curMonday.setDate(sunday.getDate() + 1);
      }

      return { statusCode: 200, message: 'OK', data: { weeks } };
    } catch (e) {
      return { statusCode: 500, message: 'Có lỗi khi lấy lịch tập.', data: { weeks: [] } };
    }
  }

  async createWeeklySchedule(payload: any) {
    const userId = Number(payload?.userId);
    const body = payload?.body || {};
    try {
      const trainee = await this.traineeRepo.findOne({ where: { id: userId } });
      if (!trainee) return { statusCode: 422, message: 'Không tìm thấy học viên' };

      // tắt lịch đang active (nếu có)
      const active = await this.scheduleRepo.findOne({ where: { traineeID: trainee.id, isTraining: 1 } });
      if (active) { active.isTraining = 0; await this.scheduleRepo.save(active); }

      // nạp dữ liệu cần thiết (đơn giản bằng repo.find)
      const exercises = await this.exerciseRepo.find();
      const muscles = await this.muscleRepo.find();
      const rules = await this.evalRepo.find();

      // map bài -> nhóm cơ & độ khó
      const exGroup: Record<number, number> = {};
      for (const m of muscles) exGroup[(m as any).exerciseID] = (m as any).id;

      const exDifficulty: Record<number, number> = {};
      for (const r of rules) {
        const exId = (r as any).exerciseID;
        if (exId != null) exDifficulty[exId] = (r as any).difficulty ?? Number(body.goal);
      }

      // pool bài (lọc theo muscle_groups FE gửi nếu có)
      const pool = exercises
        .map(e => ({
          id: e.id,
          calories: (e as any).calo || 0,
          muscleGroupId: exGroup[e.id] || 0,
          difficulty: exDifficulty[e.id] ?? Number(body.goal),
        }))
        .filter(e => !Array.isArray(body.muscles) || body.muscles.length === 0 || body.muscles.includes(e.muscleGroupId));

      // tính tuổi
      const dob = new Date(body.dateOfBirth);
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const mm = now.getMonth() - dob.getMonth();
      if (mm < 0 || (mm === 0 && now.getDate() < dob.getDate())) age--;

      // sinh kế hoạch 7 ngày theo luật
      const plan = this.generateSchedule({
        age,
        gender: body.gender,
        height: Number(body.height),
        weight: Number(body.weight),
        goal: Number(body.goal),        // 0=giữ dáng, 1=giảm mỡ, 2=tăng cơ
        daysPerWeek: Number(body.daysPerWeek),
        muscleGroups: Array.isArray(body.muscles) ? body.muscles : [],
        exercises: pool,
        rules,
      });

      // if (!plan.length || plan.every((d: any) => !d.exerciseIDs.length)) {
      //   return { statusCode: 422, message: 'Không tạo được lịch, dữ liệu bài tập không phù hợp.' };
      // }

      // tạo schedule trước (level = goal, không createdAt)
      const s = await this.scheduleRepo.save({
        traineeID: trainee.id,
        isTraining: 1,
        level: Number(body.goal),
      } as any) as Schedule;

      const details: any[] = [];
      for (const day of plan) {
        for (const exId of day.exerciseIDs) {
          details.push({ scheduleID: s.id, exerciseID: exId, date: day.date });
        }
      }
      
      if (!details.length) {
        await this.scheduleRepo.delete(s.id);
        return { statusCode: 422, message: 'Không có buổi tập nào được tạo.' };
      }
      
      await (this.scheduleDetailRepo as any).save(details);

      // trả về data tối thiểu (scheduleID + tóm tắt theo ngày)
      const data = {
        scheduleID: s.id,
        level: s.level,
        days: plan.map((d: any) => ({
          date: d.date,
          exercises: d.exerciseIDs,
          calories: d.calories,
        })),
      };

      return { statusCode: 200, message: 'Tạo lịch tập thành công.', data };
    } catch(e) {
      console.log(e)
      return { statusCode: 500, message: 'Có lỗi khi tạo lịch tập.' };
    }
  }

  // hệ “chuyên gia” đơn giản dựa trên luật trong EvaluationCriteria
  private generateSchedule(input: any) {
    const slotsPerDay = input.goal === 0 ? 4 : input.goal === 1 ? 5 : 6;
    const rules: any[] = Array.isArray(input.rules) ? input.rules : [];

    const sample = (arr: any[]) => arr.slice(0, 10).map(x => x.id);
    console.log('[ES] bắt đầu', {
      totalExercises: input.exercises.length,
      goal: input.goal,
      daysPerWeek: input.daysPerWeek,
      age: input.age,
      height: input.height,
      weight: input.weight,
      muscleGroupsChosen: input.muscleGroups,
      rules: { total: rules.length }
    });

    let cur = input.exercises;

    if (Array.isArray(input.muscleGroups) && input.muscleGroups.length) {
      const before = cur.length;
      cur = cur.filter((e: any) => input.muscleGroups.includes(e.muscleGroupId));
      console.log('[ES] lọc theo nhóm cơ người dùng', { before, after: cur.length, groups: input.muscleGroups, sample: sample(cur) });
    } else {
      console.log('[ES] bỏ qua lọc nhóm cơ (người dùng không chọn)');
    }

    const hasGoalRule = rules.some(r => (r as any).goal != null);
    if (hasGoalRule) {
      const before = cur.length;
      cur = cur.filter((ex: any) =>
        rules.some((r: any) =>
          (r.goal == null || r.goal === input.goal) &&
          (r.muscleGroupId == null || r.muscleGroupId === ex.muscleGroupId) &&
          (r.difficulty == null || r.difficulty === ex.difficulty)
        )
      );
      console.log('[ES] lọc theo goal', { before, after: cur.length, goal: input.goal, sample: sample(cur) });
    } else {
      console.log('[ES] bỏ qua lọc goal (không có rule goal)');
    }

    const hasAgeRule = rules.some(r => (r as any).minAge != null || (r as any).maxAge != null);
    if (hasAgeRule) {
      const before = cur.length;
      cur = cur.filter((ex: any) =>
        rules.some((r: any) =>
          (r.muscleGroupId == null || r.muscleGroupId === ex.muscleGroupId) &&
          (r.difficulty == null || r.difficulty === ex.difficulty) &&
          (r.goal == null || r.goal === input.goal) &&
          (r.minAge == null || input.age >= r.minAge) &&
          (r.maxAge == null || input.age <= r.maxAge)
        )
      );
      console.log('[ES] lọc theo tuổi', { before, after: cur.length, age: input.age, sample: sample(cur) });
    } else {
      console.log('[ES] bỏ qua lọc tuổi (không có rule min/max age)');
    }

    const hasHeightRule = rules.some(r => (r as any).minHeight != null || (r as any).maxHeight != null);
    if (hasHeightRule) {
      const before = cur.length;
      cur = cur.filter((ex: any) =>
        rules.some((r: any) =>
          (r.muscleGroupId == null || r.muscleGroupId === ex.muscleGroupId) &&
          (r.difficulty == null || r.difficulty === ex.difficulty) &&
          (r.goal == null || r.goal === input.goal) &&
          (r.minHeight == null || input.height >= r.minHeight) &&
          (r.maxHeight == null || input.height <= r.maxHeight)
        )
      );
      console.log('[ES] lọc theo chiều cao', { before, after: cur.length, height: input.height, sample: sample(cur) });
    } else {
      console.log('[ES] bỏ qua lọc chiều cao (không có rule min/max height)');
    }

    const hasWeightRule = rules.some(r => (r as any).minWeight != null || (r as any).maxWeight != null);
    if (hasWeightRule) {
      const before = cur.length;
      cur = cur.filter((ex: any) =>
        rules.some((r: any) =>
          (r.muscleGroupId == null || r.muscleGroupId === ex.muscleGroupId) &&
          (r.difficulty == null || r.difficulty === ex.difficulty) &&
          (r.goal == null || r.goal === input.goal) &&
          (r.minWeight == null || input.weight >= r.minWeight) &&
          (r.maxWeight == null || input.weight <= r.maxWeight)
        )
      );
      console.log('[ES] lọc theo cân nặng', { before, after: cur.length, weight: input.weight, sample: sample(cur) });
    } else {
      console.log('[ES] bỏ qua lọc cân nặng (không có rule min/max weight)');
    }

    const hasDiffRule = rules.some(r => (r as any).difficulty != null);
    if (hasDiffRule) {
      const before = cur.length;
      cur = cur.filter((ex: any) =>
        rules.some((r: any) =>
          (r.difficulty == null || r.difficulty === ex.difficulty) &&
          (r.muscleGroupId == null || r.muscleGroupId === ex.muscleGroupId) &&
          (r.goal == null || r.goal === input.goal)
        )
      );
      console.log('[ES] lọc theo độ khó', { before, after: cur.length, sample: sample(cur) });
    } else {
      console.log('[ES] bỏ qua lọc độ khó (không có rule difficulty)');
    }

    const finalBefore = cur.length;
    const final = cur.filter((ex: any) =>
      rules.length === 0
        ? true
        : rules.some((r: any) =>
            (r.goal == null || r.goal === input.goal) &&
            (r.muscleGroupId == null || r.muscleGroupId === ex.muscleGroupId) &&
            (r.difficulty == null || r.difficulty === ex.difficulty) &&
            (r.minAge == null || input.age >= r.minAge) &&
            (r.maxAge == null || input.age <= r.maxAge) &&
            (r.minHeight == null || input.height >= r.minHeight) &&
            (r.maxHeight == null || input.height <= r.maxHeight) &&
            (r.minWeight == null || input.weight >= r.minWeight) &&
            (r.maxWeight == null || input.weight <= r.maxWeight)
          )
    );
    console.log('[ES] sau tất cả điều kiện', { before: finalBefore, after: final.length, sample: sample(final) });

    const byGroup: Record<number, any[]> = {};
    for (const ex of final) {
      if (!byGroup[ex.muscleGroupId]) byGroup[ex.muscleGroupId] = [];
      byGroup[ex.muscleGroupId].push(ex);
    }
    console.log('[ES] phân bổ theo nhóm cơ', Object.fromEntries(Object.entries(byGroup).map(([k, v]) => [k, v.length])));

    const pickDays: number[] = [];
    const n = Math.max(1, Math.min(7, Number(input.daysPerWeek) || 3));
    if (n >= 7) { for (let i = 0; i < 7; i++) pickDays.push(i); }
    else {
      const used = new Set<number>();
      const step = Math.floor(7 / n) || 1;
      let curIdx = 0;
      while (pickDays.length < n) {
        while (used.has(curIdx)) curIdx = (curIdx + 1) % 7;
        pickDays.push(curIdx); used.add(curIdx); curIdx = (curIdx + step) % 7;
      }
    }
    console.log('[ES] ngày tập trong tuần', pickDays);

    const groups = input.muscleGroups?.length ? input.muscleGroups : Object.keys(byGroup).map(Number);
    let gi = 0;

    const today = new Date();
    const day0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const week: any[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(day0); d.setDate(day0.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

      if (!pickDays.includes(i)) { week.push({ date: iso, exerciseIDs: [], calories: 0 }); continue; }

      const ids: number[] = []; let kcal = 0; let tries = 0;
      while (ids.length < slotsPerDay && tries < 100) {
        const gid = groups[gi % groups.length]; gi++;
        const pool = (byGroup[gid] || []).filter(x => !ids.includes(x.id));
        if (!pool.length) { tries++; continue; }
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        ids.push(chosen.id); kcal += chosen.calories || 0;
      }
      week.push({ date: iso, exerciseIDs: ids, calories: kcal });
    }

    console.log('[ES] kế hoạch cuối', week.map(d => ({ date: d.date, count: d.exerciseIDs.length, calories: d.calories })));
    return week;
  }
}
