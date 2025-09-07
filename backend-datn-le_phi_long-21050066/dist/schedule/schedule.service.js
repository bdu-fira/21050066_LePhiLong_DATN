"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_entity_1 = require("../entities/schedule.entity");
const scheduledetail_entity_1 = require("../entities/scheduledetail.entity");
const exercise_entity_1 = require("../entities/exercise.entity");
const muscle_entity_1 = require("../entities/muscle.entity");
const exerciselevel_entity_1 = require("../entities/exerciselevel.entity");
const trainee_entity_1 = require("../entities/trainee.entity");
const result_entity_1 = require("../entities/result.entity");
const fs = require("fs");
const path = require("path");
let ScheduleService = class ScheduleService {
    scheduleRepo;
    scheduleDetailRepo;
    exerciseRepo;
    levelRepo;
    muscleRepo;
    traineeRepo;
    resultRepo;
    constructor(scheduleRepo, scheduleDetailRepo, exerciseRepo, levelRepo, muscleRepo, traineeRepo, resultRepo) {
        this.scheduleRepo = scheduleRepo;
        this.scheduleDetailRepo = scheduleDetailRepo;
        this.exerciseRepo = exerciseRepo;
        this.levelRepo = levelRepo;
        this.muscleRepo = muscleRepo;
        this.traineeRepo = traineeRepo;
        this.resultRepo = resultRepo;
    }
    async getSchedule(payload) {
        try {
            const traineeID = Number(payload?.userId) || 0;
            const schedule = await this.scheduleRepo.findOne({ where: { traineeID, isTraining: 1 } });
            if (!schedule)
                return { statusCode: 200, message: 'Không có lịch tập đang hoạt động.', data: { weeks: [] } };
            const details = await this.scheduleDetailRepo.find({ where: { scheduleID: schedule.id }, relations: ['exercise'], order: { date: 'ASC' } });
            if (!details.length)
                return { statusCode: 200, message: 'Chưa có chi tiết lịch cho lịch tập hiện tại.', data: { weeks: [] } };
            const pad = (n) => String(n).padStart(2, '0');
            const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            const fmt = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
            const parse = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
            const monday = (d) => { const x = new Date(d); const w = (x.getDay() + 6) % 7; x.setDate(x.getDate() - w); x.setHours(0, 0, 0, 0); return x; };
            const sunday = (m) => { const x = new Date(m); x.setDate(x.getDate() + 6); x.setHours(0, 0, 0, 0); return x; };
            const dayMap = {};
            for (const x of details) {
                const k = x.date;
                const s = Number(x.set) || 0;
                const r = Number(x.rep) || 0;
                const c = Number(x.exercise?.calo) || 0;
                if (!dayMap[k])
                    dayMap[k] = { exercises: 0, calories: 0 };
                dayMap[k].exercises += 1;
                dayMap[k].calories += c * s * r;
            }
            const dates = Object.keys(dayMap).sort();
            const start = monday(parse(dates[0]));
            const end = sunday(monday(parse(dates[dates.length - 1])));
            const weeks = [];
            for (let w = 0, cur = new Date(start); cur <= end; w++, cur.setDate(cur.getDate() + 7)) {
                const sun = sunday(cur);
                const days = [];
                for (let i = 0; i < 7; i++) {
                    const d = new Date(cur);
                    d.setDate(cur.getDate() + i);
                    const k = iso(d);
                    const v = dayMap[k] || { exercises: 0, calories: 0 };
                    days.push({ date: k, exercises: v.exercises, calories: v.calories });
                }
                weeks.push({ weekLabel: `Tuần ${w + 1} (${fmt(cur)}–${fmt(sun)})`, startDate: iso(cur), endDate: iso(sun), days });
            }
            return { statusCode: 200, message: 'OK', data: { weeks } };
        }
        catch (e) {
            return { statusCode: 500, message: 'Có lỗi khi lấy lịch tập.', data: { weeks: [] } };
        }
    }
    async createWeeklySchedule(input) {
        try {
            const s = await this.generateSchedule(input);
            console.log(s.week[0].exercises);
            const header = await this.scheduleRepo.save({
                traineeID: input.userId,
                level: s.meta.goal,
                isTraining: 1,
            });
            const details = s.week.flatMap((d) => d.exercises.map((e) => ({
                scheduleID: header.id,
                exerciseID: e.exerciseId,
                date: d.date,
                set: e.sets,
                rep: e.reps,
            })));
            console.log(details);
            if (details.length)
                await this.scheduleDetailRepo.save(details);
            return { statusCode: 201, message: 'Tạo lịch tập thành công!', data: { scheduleId: header.id, ...s } };
        }
        catch (e) {
            return { statusCode: 500, message: 'Có lỗi xảy ra khi tạo lịch.', error: e.message };
        }
    }
    async generateSchedule(input) {
        try {
            const p = input?.body || {};
            const height = Number(p.height) || 0;
            const weight = Number(p.weight) || 0;
            const goal = Number(p.goal) || 1;
            const muscles = Array.isArray(p.muscles) ? p.muscles.map((x) => Number(x)) : [];
            const daysPerWeek = Number(p.daysPerWeek) || 3;
            const h = height > 0 ? height : 1;
            const bmi = weight / Math.pow(h / 100, 2);
            const band = bmi < 18.5 ? 'under' : bmi <= 24.9 ? 'normal' : bmi <= 29.9 ? 'over' : bmi <= 34.9 ? 'obeseI' : 'obeseII';
            const rules = {
                under: { 1: { ds: 0, rp: 0 }, 2: { ds: 0, rp: 0 }, 3: { ds: 0, rp: 0 } },
                normal: { 1: { ds: 0, rp: 5 }, 2: { ds: 0, rp: 0 }, 3: { ds: 1, rp: 5 } },
                over: { 1: { ds: 0, rp: 10 }, 2: { ds: 0, rp: 0 }, 3: { ds: 1, rp: 0 } },
                obeseI: { 1: { ds: -1, rp: 15 }, 2: { ds: -1, rp: 0 }, 3: { ds: 0, rp: 0 } },
                obeseII: { 1: { ds: -1, rp: 20 }, 2: { ds: -1, rp: 0 }, 3: { ds: -1, rp: 0 } },
            };
            const rule = rules[band][goal] || { ds: 0, rp: 0 };
            const duration = goal === 2 ? 4 : goal === 1 ? 5 : 6;
            const start = this.nextMonday();
            const flags = this.distribute(daysPerWeek);
            const exs = await this.exerciseRepo.find();
            const _exists = (p) => { try {
                return fs.existsSync(p);
            }
            catch {
                return false;
            } };
            const _hasAssets = (exerciseId) => {
                try {
                    const dir = path.join(process.cwd(), 'uploads', 'exercise', String(exerciseId));
                    if (!_exists(dir))
                        return false;
                    const model = path.join(dir, 'model.json');
                    const weights = path.join(dir, 'model.weights.bin');
                    const instruction = path.join(dir, 'instruction.fbx');
                    let hasModel = _exists(model);
                    if (!hasModel) {
                        try {
                            const names = fs.readdirSync(dir);
                            hasModel = names.some((n) => String(n).toLowerCase().endsWith('.json'));
                        }
                        catch { }
                    }
                    return hasModel && _exists(weights) && _exists(instruction);
                }
                catch {
                    return false;
                }
            };
            if (Array.isArray(exs)) {
                const valid = exs.filter((ex) => _hasAssets(ex?.id));
                exs.length = 0;
                for (const e of valid)
                    exs.push(e);
            }
            const musRows = await this.muscleRepo.find();
            const lvlRows = await this.levelRepo.find({ where: { level: goal } });
            const muscleMap = new Map();
            for (const m of musRows) {
                const k = String(m.exerciseID);
                const a = muscleMap.get(k) || [];
                a.push(Number(m.id));
                muscleMap.set(k, a);
            }
            const baseMap = new Map();
            for (const l of lvlRows)
                baseMap.set(Number(l.exerciseID), { set: Number(l.set) || 1, rep: Number(l.rep) || 1 });
            const prefer = (exId) => (muscleMap.get(String(exId)) || []).some((g) => muscles.includes(g));
            const pick = (want) => {
                const pri = exs.filter((x) => prefer(x.id));
                const rest = exs.filter((x) => !prefer(x.id));
                const arr = [...pri, ...rest];
                const out = [];
                const seen = new Set();
                for (const e of arr) {
                    if (out.length >= want)
                        break;
                    const k = String(e.id);
                    if (seen.has(k))
                        continue;
                    seen.add(k);
                    out.push(e);
                }
                return out.slice(0, 10);
            };
            const week = [];
            for (let w = 0; w < duration; w++) {
                for (let i = 0; i < 7; i++) {
                    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + i);
                    const dateStr = this.localDate(date);
                    if (!flags[i]) {
                        week.push({ date: dateStr, weekday: this.wd(i), exercises: [] });
                        continue;
                    }
                    const chosen = pick(8);
                    const exercises = chosen.map((ex) => {
                        const base = baseMap.get(Number(ex.id)) || { set: 1, rep: 1 };
                        console.log(base, ': ', ex.id);
                        const sets = this.clamp(Number(base.set) + Number(rule.ds || 0), 1, 100);
                        const reps = this.clamp(Math.round(Number(base.rep) * (1 + Number(rule.rp || 0) / 100)), 1, 100);
                        return { exerciseId: ex.id, name: ex.name, sets, reps };
                    });
                    week.push({ date: dateStr, weekday: this.wd(i), exercises });
                }
            }
            return { meta: { bmi: Number((bmi || 0).toFixed(2)), band, goal, daysPerWeek, weeks: duration }, week };
        }
        catch (e) {
            return { meta: null, week: [], error: e?.message || String(e) };
        }
    }
    clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
    wd(i) { return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]; }
    nextMonday() {
        const now = new Date();
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const day = d.getDay();
        const diff = (day === 1 ? 0 : (8 - (day || 7)) % 7);
        d.setDate(d.getDate() + diff);
        return d;
    }
    distribute(n) {
        const arr = [false, false, false, false, false, false];
        if (n <= 0)
            return arr;
        const idx = {
            1: [0],
            2: [0, 3],
            3: [0, 2, 4],
            4: [0, 1, 3, 5],
            5: [0, 1, 2, 3, 4],
            6: [0, 1, 2, 3, 4, 5],
        }[n > 6 ? 6 : n];
        idx.forEach((i) => arr[i] = true);
        return arr;
    }
    localDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    }
    async updateWeeklySchedule(payload) {
        try {
            const traineeID = Number(payload?.userId) || 0;
            const rating = Number(payload?.rating);
            if (![1, -1].includes(rating)) {
                return { isSuccess: false, statusCode: 400, message: 'Phải chọn tăng (+1) hoặc giảm (-1) độ khó.' };
            }
            const schedule = await this.scheduleRepo.findOne({ where: { traineeID, isTraining: 1 } });
            if (!schedule) {
                return { isSuccess: false, statusCode: 404, message: 'Không tìm thấy lịch tập đang hoạt động.' };
            }
            if (schedule.level + rating < 1 || schedule.level + rating > 3) {
                return { isSuccess: false, statusCode: 409, message: 'Đã đạt ngưỡng giới hạn độ khó.' };
            }
            const trainee = await this.traineeRepo.findOne({ where: { id: traineeID } });
            if (!trainee) {
                return { isSuccess: false, statusCode: 404, message: 'Không tìm thấy thông tin người tập.' };
            }
            const h = trainee.height > 0 ? trainee.height : 1;
            const bmi = trainee.weight / Math.pow(h / 100, 2);
            const band = bmi < 18.5 ? 'under'
                : bmi <= 24.9 ? 'normal'
                    : bmi <= 29.9 ? 'over'
                        : bmi <= 34.9 ? 'obeseI'
                            : 'obeseII';
            const rules = {
                under: { 1: { ds: 0, rp: 0 }, 2: { ds: 0, rp: 0 }, 3: { ds: 0, rp: 0 } },
                normal: { 1: { ds: 0, rp: 5 }, 2: { ds: 0, rp: 0 }, 3: { ds: 1, rp: 5 } },
                over: { 1: { ds: 0, rp: 10 }, 2: { ds: 0, rp: 0 }, 3: { ds: 1, rp: 0 } },
                obeseI: { 1: { ds: -1, rp: 15 }, 2: { ds: -1, rp: 0 }, 3: { ds: 0, rp: 0 } },
                obeseII: { 1: { ds: -1, rp: 20 }, 2: { ds: -1, rp: 0 }, 3: { ds: -1, rp: 0 } },
            };
            const baseRule = rules[band][schedule.level] || { ds: 0, rp: 0 };
            const adjRule = {
                ds: baseRule.ds * rating,
                rp: baseRule.rp * rating,
            };
            const details = await this.scheduleDetailRepo.find({
                where: { scheduleID: schedule.id, isTrained: 0 },
            });
            if (!details.length) {
                return { isSuccess: true, statusCode: 200, message: 'Không còn bài tập nào để điều chỉnh.' };
            }
            for (const d of details) {
                d.set = this.clamp(d.set + adjRule.ds, 1, 100);
                d.rep = this.clamp(Math.round(d.rep * (1 + adjRule.rp / 100)), 1, 100);
            }
            schedule.level += rating;
            await this.scheduleRepo.save(schedule);
            await this.scheduleDetailRepo.save(details);
            return {
                isSuccess: true,
                statusCode: 200,
                message: 'Điều chỉnh lịch tập thành công.',
                data: { scheduleId: schedule.id, adjusted: details.length, newLevel: schedule.level },
            };
        }
        catch (e) {
            return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
    async deleteSchedule(payload) {
        try {
            const traineeID = Number(payload?.userId) || 0;
            const schedule = await this.scheduleRepo.findOne({ where: { traineeID, isTraining: 1 } });
            if (!schedule) {
                return { isSuccess: false, statusCode: 404, message: 'Không tìm thấy lịch tập đang hoạt động.' };
            }
            schedule.isTraining = 0;
            await this.scheduleRepo.save(schedule);
            return { isSuccess: true, statusCode: 200, message: 'Xóa lịch tập thành công.' };
        }
        catch (e) {
            return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
    async getStats(payload) {
        try {
            const traineeID = Number(payload?.userId) || 0;
            const schedules = await this.scheduleRepo.find({ where: { traineeID, isTraining: 1 } });
            if (!schedules.length) {
                return {
                    statusCode: 200,
                    data: {
                        summary: { progressText: '0/0', trainedExercises: 0, totalExercises: 0, calories: 0, wrongActions: 0 },
                        days: [],
                    },
                };
            }
            const scheduleIDs = schedules.map((s) => s.id);
            const rows = await this.scheduleDetailRepo
                .createQueryBuilder('d')
                .leftJoin(exercise_entity_1.Exercise, 'e', 'e.id = d.exerciseID')
                .leftJoin(result_entity_1.Result, 'r', 'r.scheduleDetailID = d.id')
                .where('d.scheduleID IN (:...ids)', { ids: scheduleIDs })
                .select([
                'd.id           AS id',
                'd.date         AS date',
                'd.set          AS setCount',
                'd.rep          AS repCount',
                'd.isTrained    AS isTrained',
                'e.calo         AS calo',
                'COUNT(r.id)    AS wrong',
            ])
                .groupBy('d.id')
                .addGroupBy('d.date')
                .addGroupBy('d.set')
                .addGroupBy('d.rep')
                .addGroupBy('d.isTrained')
                .addGroupBy('e.calo')
                .orderBy('d.date', 'ASC')
                .getRawMany();
            if (!rows.length) {
                return {
                    statusCode: 200,
                    data: {
                        summary: { progressText: '0/0', trainedExercises: 0, totalExercises: 0, calories: 0, wrongActions: 0 },
                        days: [],
                    },
                };
            }
            const pad = (n) => String(n).padStart(2, '0');
            const toYMD = (input) => {
                if (!input)
                    return { y: 0, m: 0, d: 0 };
                if (typeof input === 'string') {
                    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
                    if (m)
                        return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
                    const dt = new Date(input);
                    return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
                }
                const dt = input instanceof Date ? input : new Date(input);
                return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
            };
            const toDateKey = (v) => {
                const { y, m, d } = toYMD(v);
                return `${y}-${pad(m)}-${pad(d)}`;
            };
            const toLabel = (v) => {
                const { m, d } = toYMD(v);
                return `${pad(d)}/${pad(m)}`;
            };
            const to01 = (v) => {
                if (Buffer.isBuffer(v))
                    return v.length && v[0] ? 1 : 0;
                if (typeof v === 'boolean')
                    return v ? 1 : 0;
                const n = Number(v);
                return Number.isFinite(n) ? (n === 0 ? 0 : 1) : 0;
            };
            const dayMap = {};
            let totalExercises = 0;
            let trainedExercises = 0;
            let totalCalories = 0;
            let totalWrong = 0;
            for (const r of rows) {
                const dateKey = toDateKey(r.date);
                if (!dayMap[dateKey]) {
                    dayMap[dateKey] = {
                        date: dateKey,
                        label: toLabel(r.date),
                        exercises: 0,
                        trained: 0,
                        calories: 0,
                        wrongActions: 0,
                    };
                }
                dayMap[dateKey].exercises += 1;
                totalExercises += 1;
                const isTrained = to01(r.isTrained);
                const wrong = Number(r.wrong) || 0;
                if (isTrained === 1) {
                    dayMap[dateKey].trained += 1;
                    trainedExercises += 1;
                    const burned = (Number(r.setCount) || 0) *
                        (Number(r.repCount) || 0) *
                        (Number(r.calo) || 0);
                    dayMap[dateKey].calories += burned;
                    totalCalories += burned;
                }
                dayMap[dateKey].wrongActions += wrong;
                totalWrong += wrong;
            }
            return {
                statusCode: 200,
                data: {
                    summary: {
                        progressText: `${trainedExercises}/${totalExercises}`,
                        trainedExercises,
                        totalExercises,
                        calories: totalCalories,
                        wrongActions: totalWrong,
                    },
                },
            };
        }
        catch (e) {
            return { statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
    async getAnalytics(payload) {
        try {
            const traineeID = Number(payload?.userId) || 0;
            const schedules = await this.scheduleRepo.find({
                where: { traineeID, isTraining: 1 },
                select: ['id'],
            });
            if (!schedules.length) {
                return {
                    statusCode: 200,
                    data: {
                        summary: {
                            totalWrong: 0,
                            stage: {
                                early: { count: 0, percent: 0 },
                                mid: { count: 0, percent: 0 },
                                late: { count: 0, percent: 0 },
                            },
                        },
                        topExercises: [],
                    },
                };
            }
            const scheduleIDs = schedules.map(s => s.id);
            const details = await this.scheduleDetailRepo
                .createQueryBuilder('d')
                .leftJoin(exercise_entity_1.Exercise, 'e', 'e.id = d.exerciseID')
                .where('d.scheduleID IN (:...ids)', { ids: scheduleIDs })
                .andWhere('d.isTrained = :one', { one: 1 })
                .select([
                'd.id        AS id',
                'd.rep       AS totalRep',
                'e.id        AS exerciseID',
                'e.name      AS exerciseName',
            ])
                .getRawMany();
            if (!details.length) {
                return {
                    statusCode: 200,
                    data: {
                        summary: {
                            totalWrong: 0,
                            stage: {
                                early: { count: 0, percent: 0 },
                                mid: { count: 0, percent: 0 },
                                late: { count: 0, percent: 0 },
                            },
                        },
                        topExercises: [],
                    },
                };
            }
            const detailIDs = details.map((d) => Number(d.id));
            const detailMap = {};
            for (const d of details) {
                detailMap[Number(d.id)] = {
                    totalRep: Number(d.totalRep) || 0,
                    exerciseID: Number(d.exerciseID) || 0,
                    exerciseName: String(d.exerciseName || 'Bài tập'),
                };
            }
            const placeholders = detailIDs.map(() => '?').join(',');
            const sql = `
        SELECT scheduleDetailID AS id, rep AS wrongRep
        FROM result
        WHERE scheduleDetailID IN (${placeholders})
      `;
            const wrongRows = await this.scheduleDetailRepo.query(sql, detailIDs);
            if (!wrongRows.length) {
                return {
                    statusCode: 200,
                    data: {
                        summary: {
                            totalWrong: 0,
                            stage: {
                                early: { count: 0, percent: 0 },
                                mid: { count: 0, percent: 0 },
                                late: { count: 0, percent: 0 },
                            },
                        },
                        topExercises: [],
                    },
                };
            }
            const stageCount = { early: 0, mid: 0, late: 0 };
            const exMap = {};
            const pickStage = (wrongRep, totalRep) => {
                const wr = Number(wrongRep) || 0;
                const tr = Number(totalRep) || 0;
                if (tr <= 0 || wr <= 0)
                    return 'mid';
                const ratio = wr / tr;
                if (ratio <= 0.20)
                    return 'early';
                if (ratio >= 0.80)
                    return 'late';
                return 'mid';
            };
            for (const row of wrongRows) {
                const id = Number(row.id);
                const meta = detailMap[id];
                if (!meta)
                    continue;
                const stage = pickStage(Number(row.wrongRep), meta.totalRep);
                stageCount[stage] += 1;
                const exID = meta.exerciseID;
                const exName = meta.exerciseName;
                if (!exMap[exID])
                    exMap[exID] = { exerciseID: exID, exerciseName: exName, wrongCount: 0 };
                exMap[exID].wrongCount += 1;
            }
            const totalWrong = stageCount.early + stageCount.mid + stageCount.late;
            const percent = (n) => (totalWrong ? Math.round((n * 10000) / totalWrong) / 100 : 0);
            const topExercises = Object.values(exMap)
                .sort((a, b) => (b.wrongCount - a.wrongCount) || (a.exerciseID - b.exerciseID))
                .slice(0, 5);
            return {
                statusCode: 200,
                data: {
                    summary: {
                        totalWrong,
                        stage: {
                            early: { count: stageCount.early, percent: percent(stageCount.early) },
                            mid: { count: stageCount.mid, percent: percent(stageCount.mid) },
                            late: { count: stageCount.late, percent: percent(stageCount.late) },
                        },
                    },
                    topExercises,
                },
            };
        }
        catch (e) {
            return { statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
    async getAllStats() {
        try {
            const [traineeCount, exerciseCount, scheduleDetailCount, trainedScheduleDetailCount, resultCount, activeScheduleCount,] = await Promise.all([
                this.traineeRepo.count(),
                this.exerciseRepo.count(),
                this.scheduleDetailRepo.count(),
                this.scheduleDetailRepo.count({ where: { isTrained: (0, typeorm_2.In)([1, true]) } }),
                this.resultRepo.count(),
                this.scheduleRepo.count({ where: { isTraining: (0, typeorm_2.In)([1, true]) } }),
            ]);
            return {
                statusCode: 200,
                data: {
                    trainees: traineeCount,
                    exercises: exerciseCount,
                    createdExercises: scheduleDetailCount,
                    practicedExercises: trainedScheduleDetailCount,
                    errors: resultCount,
                    createdSchedules: activeScheduleCount,
                },
            };
        }
        catch (e) {
            return { statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
};
exports.ScheduleService = ScheduleService;
exports.ScheduleService = ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(schedule_entity_1.Schedule)),
    __param(1, (0, typeorm_1.InjectRepository)(scheduledetail_entity_1.ScheduleDetail)),
    __param(2, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __param(3, (0, typeorm_1.InjectRepository)(exerciselevel_entity_1.ExerciseLevel)),
    __param(4, (0, typeorm_1.InjectRepository)(muscle_entity_1.Muscle)),
    __param(5, (0, typeorm_1.InjectRepository)(trainee_entity_1.Trainee)),
    __param(6, (0, typeorm_1.InjectRepository)(result_entity_1.Result)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ScheduleService);
//# sourceMappingURL=schedule.service.js.map