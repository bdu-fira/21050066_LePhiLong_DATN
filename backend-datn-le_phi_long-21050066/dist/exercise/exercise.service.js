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
exports.ExerciseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const path = require("path");
const exercise_entity_1 = require("../entities/exercise.entity");
const muscle_entity_1 = require("../entities/muscle.entity");
const typeorm_2 = require("typeorm");
const fs = require("fs");
const os = require("os");
const exerciselevel_entity_1 = require("../entities/exerciselevel.entity");
const evaluationcriteria_entity_1 = require("../entities/evaluationcriteria.entity");
const position_entity_1 = require("../entities/position.entity");
const joint_entity_1 = require("../entities/joint.entity");
const schedule_entity_1 = require("../entities/schedule.entity");
const scheduledetail_entity_1 = require("../entities/scheduledetail.entity");
const child_process_1 = require("child_process");
const result_entity_1 = require("../entities/result.entity");
const jointList_entity_1 = require("../entities/jointList.entity");
const child_process_2 = require("child_process");
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_2.execFile);
let ExerciseService = class ExerciseService {
    dataSource;
    _exerciseRepository;
    _muscleRepository;
    _exerciseLevelRepository;
    _evaluationCriteria;
    _positionRepository;
    _scheduleRepository;
    _scheduleDetailRepository;
    _jointRepository;
    _resultRepository;
    constructor(dataSource, _exerciseRepository, _muscleRepository, _exerciseLevelRepository, _evaluationCriteria, _positionRepository, _scheduleRepository, _scheduleDetailRepository, _jointRepository, _resultRepository) {
        this.dataSource = dataSource;
        this._exerciseRepository = _exerciseRepository;
        this._muscleRepository = _muscleRepository;
        this._exerciseLevelRepository = _exerciseLevelRepository;
        this._evaluationCriteria = _evaluationCriteria;
        this._positionRepository = _positionRepository;
        this._scheduleRepository = _scheduleRepository;
        this._scheduleDetailRepository = _scheduleDetailRepository;
        this._jointRepository = _jointRepository;
        this._resultRepository = _resultRepository;
    }
    async create(payload) {
        try {
            const name = String(payload?.name ?? '').trim();
            const minAge = Number(payload?.minAge);
            const maxAge = Number(payload?.maxAge);
            const calo = Number(payload?.calo);
            const muscles = Array.isArray(payload?.muscles)
                ? [...new Set(payload.muscles.map((x) => Number(x)))]
                : [];
            const existed = await this._exerciseRepository
                .createQueryBuilder('ex')
                .where('LOWER(ex.name) = LOWER(:name)', { name })
                .getOne();
            if (existed) {
                return { isSuccess: false, statusCode: 409, message: 'Tên bài tập đã tồn tại!' };
            }
            const saved = await this._exerciseRepository.save(this._exerciseRepository.create({ name, minAge, maxAge, calo }));
            await this._muscleRepository
                .createQueryBuilder()
                .insert()
                .into(muscle_entity_1.Muscle)
                .values(muscles.map((gid) => ({
                id: gid,
                exerciseID: saved.id,
            })))
                .execute();
            await this._positionRepository.save([
                { exerciseID: saved.id, name: 'Label 01', order: 0, },
                { exerciseID: saved.id, name: 'Label 02', order: 1, },
                { exerciseID: saved.id, name: 'Label 03', order: 2, },
            ]);
            await this._exerciseLevelRepository.save([
                { exerciseID: saved.id, level: 1, set: 1, rep: 10 },
                { exerciseID: saved.id, level: 2, set: 2, rep: 20 },
                { exerciseID: saved.id, level: 3, set: 3, rep: 30 },
            ]);
            return {
                isSuccess: true,
                statusCode: 201,
                message: 'Tạo bài tập thành công!',
                data: { id: saved.id, name: saved.name, minAge: saved.minAge, maxAge: saved.maxAge, calo: saved.calo },
            };
        }
        catch (e) {
            console.log(e);
            return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
    async findAll(payload) {
        try {
            const name = String(payload?.name ?? '').trim();
            const gid = payload?.muscleGroupId !== undefined &&
                payload?.muscleGroupId !== null &&
                payload?.muscleGroupId !== ''
                ? Number(payload.muscleGroupId)
                : NaN;
            const qb = this._exerciseRepository.createQueryBuilder('ex');
            if (!Number.isNaN(gid))
                qb.innerJoin('ex.muscles', 'm');
            const clauses = [];
            const params = {};
            if (name) {
                clauses.push('ex.name LIKE :name');
                params.name = `%${name}%`;
            }
            if (!Number.isNaN(gid)) {
                clauses.push('m.groupId = :gid');
                params.gid = gid;
            }
            qb.where(clauses.length ? clauses.join(' AND ') : '1=1')
                .orderBy('ex.id', 'ASC');
            const data = await qb.getMany();
            return { isSuccess: true, statusCode: 200, message: 'Lấy danh sách bài tập thành công', data };
        }
        catch {
            return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
    async findOne(payload) {
        try {
            const exercise = await this._exerciseRepository.findOne({
                where: { id: payload.id },
                relations: {
                    levels: true,
                    muscles: true,
                    positions: { evaluationCriteria: { joints: true } },
                },
                order: {
                    positions: {
                        order: 'ASC',
                        evaluationCriteria: {
                            joints: {
                                order: 'ASC'
                            }
                        }
                    },
                }
            });
            if (!exercise)
                return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };
            return { isSuccess: true, statusCode: 200, message: 'Tìm thành công', data: exercise };
        }
        catch (e) {
            return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
    async delete(payload) {
        try {
            const exercise = await this._exerciseRepository.findOne({ where: { id: payload.id } });
            if (!exercise)
                return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };
            const abs = path.join(process.cwd(), 'uploads', String(payload.id));
            if (fs.existsSync(abs))
                fs.rmSync(abs, { recursive: true, force: true });
            await this._exerciseRepository.remove(exercise);
            return { isSuccess: true, statusCode: 200, message: 'Xóa bài tập thành công!' };
        }
        catch (e) {
            return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
    async updateInfo(payload) {
        try {
            const id = Number(payload?.id);
            if (!id)
                return { isSuccess: false, statusCode: 400, message: 'Thiếu id!' };
            const exercise = await this._exerciseRepository.findOne({ where: { id } });
            if (!exercise)
                return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };
            if (typeof payload.name === 'string') {
                const name = payload.name.trim();
                if (name && name.toLowerCase() !== (exercise.name ?? '').toLowerCase()) {
                    const existed = await this._exerciseRepository
                        .createQueryBuilder('ex')
                        .where('LOWER(ex.name) = LOWER(:name)', { name })
                        .andWhere('ex.id <> :id', { id })
                        .getOne();
                    if (existed)
                        return { isSuccess: false, statusCode: 409, message: 'Tên bài tập đã tồn tại!' };
                    exercise.name = name;
                }
            }
            if (payload.minAge !== undefined)
                exercise.minAge = Number(payload.minAge);
            if (payload.maxAge !== undefined)
                exercise.maxAge = Number(payload.maxAge);
            if (payload.calo !== undefined)
                exercise.calo = Number(payload.calo);
            await this._exerciseRepository.save(exercise);
            if (Array.isArray(payload.muscles)) {
                const rows = (payload.muscles || [])
                    .map((v) => Number(v))
                    .filter((n) => Number.isInteger(n))
                    .map((gid) => ({ exerciseID: id, id: gid }));
                await this._muscleRepository.createQueryBuilder().delete().from(muscle_entity_1.Muscle).where('exerciseID = :id', { id }).execute();
                if (rows.length)
                    await this._muscleRepository.createQueryBuilder().insert().into(muscle_entity_1.Muscle).values(rows).execute();
            }
            if (payload.file) {
                const dir = path.join(process.cwd(), 'uploads', 'exercise', String(id));
                fs.mkdirSync(dir, { recursive: true });
                const filePath = path.join(dir, 'instruction.fbx');
                fs.writeFileSync(filePath, payload.file.buffer);
            }
            return {
                isSuccess: true,
                statusCode: 200,
                message: 'Cập nhật thành công!',
                data: { id: exercise.id, name: exercise.name, minAge: exercise.minAge, maxAge: exercise.maxAge, calo: exercise.calo },
            };
        }
        catch (error) {
            return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
    async updateLevel(payload) {
        try {
            const exercise = await this._exerciseRepository.findOne({ where: { id: payload.id } });
            if (!exercise)
                return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };
            await this._exerciseLevelRepository.delete({ exercise: { id: payload.id } });
            const levels = Array.isArray(payload.levels) ? payload.levels : [];
            if (levels.length) {
                const rows = levels.map((l, index) => ({
                    exercise: { id: payload.id },
                    level: index + 1,
                    set: l.set,
                    rep: l.rep,
                }));
                await this._exerciseLevelRepository.insert(rows);
            }
            const data = await this._exerciseRepository.findOne({
                where: { id: payload.id },
                relations: { levels: true },
            });
            return { isSuccess: true, statusCode: 200, message: 'Cập nhật level thành công', data };
        }
        catch (e) {
            return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
    async updateCriteria(payload) {
        try {
            const id = Number(payload?.id);
            const exercise = await this._exerciseRepository.findOne({ where: { id }, relations: ['positions.evaluationCriteria'] });
            if (!exercise)
                return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };
            await this._evaluationCriteria.delete({ position: { id: payload.positionID } });
            const jointList = [];
            const criteria = (payload.criteria || []).map((c) => ({
                positionID: payload.positionID,
                operator: c.operator,
                angle: c.angle,
                errorMessage: c.message,
            }));
            const criteriaResult = await this._evaluationCriteria.save(criteria);
            criteriaResult.forEach((c, index) => {
                payload.criteria[index].jointAngle.map((data, i) => {
                    const j = new joint_entity_1.Joint();
                    j.evaluationCriteriaID = c.id;
                    j.id = data;
                    j.order = i;
                    jointList.push(j);
                });
            });
            await this._jointRepository.save(jointList);
            const voices = 'voices';
            const dir = path.join(process.cwd(), 'uploads', 'exercise', String(id));
            const voiceDir = path.join(dir, voices);
            fs.mkdirSync(voiceDir, { recursive: true });
            const position = exercise.positions.find((position) => (position.id === payload.positionID));
            const abs = path.join(process.cwd(), 'uploads', 'exercise', String(payload.id), 'voices');
            if (fs.existsSync(abs)) {
                position?.evaluationCriteria.map((criteria) => {
                    const filePath = path.join(abs, String(payload.positionID) + '-' + String(criteria.id) + '.wav');
                    if (fs.existsSync(filePath))
                        fs.unlinkSync(filePath);
                });
            }
            else {
                fs.mkdirSync(abs, { recursive: true });
            }
            for (const c of criteriaResult) {
                const msg = String(c?.errorMessage || '').trim();
                if (!msg)
                    continue;
                const outPath = path.join(voiceDir, `${payload.positionID}-${c.id}.wav`);
                await this.convertTextToSpeech(msg, outPath);
            }
            return { isSuccess: true, statusCode: 200, message: 'Cập nhật tiêu chí thành công' };
        }
        catch (e) {
            console.log(e);
            return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
    async updateModel(payload) {
        try {
            const id = Number(payload?.id);
            if (!id)
                return { isSuccess: false, statusCode: 400, message: 'Thiếu id!' };
            const exercise = await this._exerciseRepository.findOne({ where: { id } });
            if (!exercise)
                return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };
            if (payload?.modelJson || payload?.modelWeights) {
                const dir = path.join(process.cwd(), 'uploads', 'exercise', String(id));
                fs.mkdirSync(dir, { recursive: true });
                if (payload?.modelJson) {
                    const modelJsonPath = path.join(dir, 'model.json');
                    fs.writeFileSync(modelJsonPath, payload.modelJson.buffer);
                    exercise.path = path.relative(process.cwd(), modelJsonPath).replace(/\\/g, '/');
                }
                if (payload?.modelWeights) {
                    const weightsFilePath = path.join(dir, 'model.weights.bin');
                    fs.writeFileSync(weightsFilePath, payload.modelWeights.buffer);
                }
            }
            if (payload?.accuracy !== undefined)
                exercise.lastTrainResult = Number(payload.accuracy);
            await this._exerciseRepository.save(exercise);
            const positionNames = Object.entries(JSON.parse(payload.labels)).map(([exerciseID, name]) => ({
                exerciseID: Number(exerciseID),
                name: name
            }));
            for (const [index, pos] of positionNames.entries()) {
                const existingPos = new position_entity_1.Position();
                existingPos.id = pos.exerciseID;
                existingPos.exerciseID = id;
                existingPos.name = pos.name;
                existingPos.order = index;
                await this._positionRepository.save(existingPos);
            }
            return {
                isSuccess: true,
                statusCode: 200,
                message: 'Lưu mô hình thành công',
                data: {
                    id: exercise.id,
                    lastTrainResult: exercise.lastTrainResult ?? null,
                    path: exercise.path ?? null,
                },
            };
        }
        catch (e) {
            return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
    async convertTextToSpeech(text, destWav) {
        const candidateSrcDirs = [
            path.join(process.cwd(), 'pipertts'),
            path.join(__dirname, '..', '..', 'pipertts'),
            path.join(__dirname, 'pipertts'),
        ];
        const srcRoot = candidateSrcDirs.find(p => fs.existsSync(p));
        if (!srcRoot) {
            throw new Error(`[TTS] Không tìm thấy thư mục 'pipertts' ở các vị trí:\n- ${candidateSrcDirs.join('\n- ')}`);
        }
        const work = path.join(os.tmpdir(), 'piper-work');
        const bin = path.join(work, process.platform === 'win32' ? 'piper.exe' : 'piper');
        const model = path.join(work, 'vi_VN-vais1000-medium.onnx');
        const cfg = path.join(work, 'vi_VN-vais1000-medium.onnx.json');
        const esDir = path.join(work, 'espeak-ng-data');
        const isReady = () => fs.existsSync(bin) &&
            fs.existsSync(model) &&
            fs.existsSync(cfg) &&
            fs.existsSync(esDir);
        if (!isReady()) {
            try {
                fs.rmSync(work, { recursive: true, force: true });
            }
            catch { }
            fs.cpSync(srcRoot, work, { recursive: true });
            try {
                if (process.platform !== 'win32' && fs.existsSync(bin))
                    fs.chmodSync(bin, 0o755);
            }
            catch { }
        }
        if (!isReady()) {
            throw new Error(`[TTS] Không thể chuẩn bị Piper runtime trong ${work}`);
        }
        const tmpOut = path.join(work, `out-${Date.now()}-${Math.random().toString(36).slice(2)}.wav`);
        const processTextWithPauses = (inputText) => {
            return inputText
                .replace(/([,\.!])/g, '$1<pause>')
                .replace(/\<pause\>/g, '  ');
        };
        const processedText = processTextWithPauses(text);
        await new Promise((resolve, reject) => {
            const p = (0, child_process_1.spawn)(bin, ['--model', path.basename(model), '--config', path.basename(cfg), '--output_file', path.basename(tmpOut)], {
                cwd: work,
                env: { ...process.env, ESPEAKNG_DATA_PATH: esDir },
                stdio: ['pipe', 'pipe', 'pipe'],
                windowsHide: true,
            });
            let err = '';
            p.stderr.on('data', d => { err += d.toString(); });
            p.on('error', reject);
            p.on('close', code => code === 0 ? resolve() : reject(new Error(`[TTS] Piper exit ${code}${err ? `\n${err}` : ''}`)));
            p.stdin.end(processedText.trim() + '\n', 'utf8');
        });
        fs.mkdirSync(path.dirname(destWav), { recursive: true });
        fs.copyFileSync(tmpOut, destWav);
    }
    async getExercise(payload) {
        try {
            const date = String(payload?.date ?? '').trim();
            const userId = Number(payload?.userId);
            if (!date)
                return { isSuccess: false, statusCode: 400, message: 'Thiếu ngày.' };
            const schedule = await this._scheduleRepository.findOne({
                where: { traineeID: userId, isTraining: 1 },
                relations: ['details', 'details.exercise'],
            });
            const details = (schedule.details || []).filter((x) => String(x.date) === date);
            const data = [];
            for (const d of details) {
                const ex = await this._exerciseRepository.findOne({
                    where: { id: d.exerciseID },
                    relations: ['positions', 'positions.evaluationCriteria', 'positions.evaluationCriteria.joints'],
                });
                if (!ex)
                    return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };
                const level = await this._exerciseLevelRepository.findOne({ where: { exerciseID: ex.id, level: schedule.level } });
                const dir = path.join(process.cwd(), 'uploads', 'exercise', String(ex.id));
                const modelPath = path.join(dir, 'model.json');
                const weightsPath = path.join(dir, 'model.weights.bin');
                const fbxPath = path.join(dir, 'instruction.fbx');
                const voicePaths = path.join(dir, 'voices');
                let voiceFiles = [];
                fs.readdir(voicePaths, { withFileTypes: true }, (err, files) => {
                    if (!err)
                        files.forEach(file => {
                            voiceFiles.push(path.join('uploads', 'exercise', String(ex.id), 'voices', file.name));
                        });
                });
                const positions = (ex.positions || []).map((p) => ({
                    id: p.id,
                    name: p.name,
                    evaluationCriteria: (p.evaluationCriteria || []).map((c) => ({
                        id: c.id,
                        positionID: p.id,
                        operator: c.operator,
                        angle: c.angle,
                        errorMessage: c.errorMessage,
                        joints: (c.joints || []).map((j) => j.id),
                    })),
                }));
                data.push({
                    id: ex.id,
                    name: ex.name,
                    set: level?.set ?? 0,
                    rep: level?.rep ?? 0,
                    calo: (ex.calo * level.set * level.rep).toFixed(1),
                    scheduleDetailID: d.id,
                    positions,
                    voicePaths: voiceFiles,
                    model: {
                        model: path.relative(process.cwd(), modelPath).replace(/\\/g, '/'),
                        weight: path.relative(process.cwd(), weightsPath).replace(/\\/g, '/'),
                        instruction: path.relative(process.cwd(), fbxPath).replace(/\\/g, '/'),
                    },
                });
            }
            return { isSuccess: true, statusCode: 200, message: 'Thành công', data };
        }
        catch (e) {
            return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
    async saveStats(payload) {
        try {
            const items = Array.isArray(payload.errors) ? payload.errors : [];
            const resultRepo = this.dataSource.getRepository(result_entity_1.Result);
            const jointListRepo = this.dataSource.getRepository(jointList_entity_1.JointList);
            const savedResultIDs = [];
            const scheduleDetailList = await this._scheduleDetailRepository.find({
                where: {
                    schedule: {
                        traineeID: payload.userID,
                        isTraining: 1,
                    },
                    date: payload.date,
                },
                relations: {
                    results: true,
                }
            });
            for (const scheduleDetail of scheduleDetailList) {
                scheduleDetail.isTrained = 1;
                await this._scheduleDetailRepository.save(scheduleDetail);
                await this._resultRepository.remove(scheduleDetail.results);
            }
            for (const raw of items) {
                const scheduleDetailID = Number(raw?.scheduleDetailID);
                const set = Number(raw?.set);
                const rep = Number(raw?.rep);
                const positionName = String(raw?.positionName ?? '').trim();
                const actualAngle = Number(raw?.actualAngle);
                const errorMessage = String(raw?.errorMessage ?? '').trim();
                const jointList = Array.isArray(raw?.jointList)
                    ? [...new Set(raw.jointList.map((x) => Number(x)).filter((x) => !isNaN(x)))]
                    : [];
                const saved = await resultRepo.save(resultRepo.create({
                    scheduleDetailID,
                    set,
                    rep,
                    positionName,
                    actualAngle,
                    errorMessage,
                }));
                if (jointList.length > 0) {
                    await jointListRepo
                        .createQueryBuilder()
                        .insert()
                        .into(jointList_entity_1.JointList)
                        .values(jointList.map((jid, index) => ({
                        id: jid,
                        resultID: saved.id,
                        order: index
                    })))
                        .execute();
                }
                savedResultIDs.push(saved.id);
            }
            return { isSuccess: true, statusCode: 200, message: 'Lưu thành công' };
        }
        catch (e) {
            console.log(e);
            return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
    async getExamples() {
        try {
            const rows = await this._exerciseRepository.find({
                select: ['id', 'name'],
            });
            const data = (rows || []).map((x) => ({
                id: x.id,
                name: x.name,
                path: path.join(process.cwd(), 'uploads', 'exercise', String(x.id), 'instruction.fbx'),
            }));
            return { isSuccess: true, statusCode: 200, message: 'Thành công', data };
        }
        catch {
            return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
        }
    }
};
exports.ExerciseService = ExerciseService;
exports.ExerciseService = ExerciseService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __param(2, (0, typeorm_1.InjectRepository)(muscle_entity_1.Muscle)),
    __param(3, (0, typeorm_1.InjectRepository)(exerciselevel_entity_1.ExerciseLevel)),
    __param(4, (0, typeorm_1.InjectRepository)(evaluationcriteria_entity_1.EvaluationCriteria)),
    __param(5, (0, typeorm_1.InjectRepository)(position_entity_1.Position)),
    __param(6, (0, typeorm_1.InjectRepository)(schedule_entity_1.Schedule)),
    __param(7, (0, typeorm_1.InjectRepository)(scheduledetail_entity_1.ScheduleDetail)),
    __param(8, (0, typeorm_1.InjectRepository)(joint_entity_1.Joint)),
    __param(9, (0, typeorm_1.InjectRepository)(result_entity_1.Result)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ExerciseService);
//# sourceMappingURL=exercise.service.js.map