import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import { Exercise } from 'src/entities/exercise.entity';
import { Muscle } from 'src/entities/muscle.entity';
import { DataSource, Repository } from 'typeorm';
import * as fs from 'fs';
import * as os from 'os';
import { existsSync, promises as fsp } from 'fs';
import { ExerciseLevel } from 'src/entities/exerciselevel.entity';
import { EvaluationCriteria } from 'src/entities/evaluationcriteria.entity';
import { Position } from 'src/entities/position.entity';
import { Joint } from 'src/entities/joint.entity';
import { Schedule } from 'src/entities/schedule.entity';
import { ScheduleDetail } from 'src/entities/scheduledetail.entity';
import { spawn } from 'child_process';
import { Result } from 'src/entities/result.entity';
import { JointList } from 'src/entities/jointList.entity';
import { execFile } from 'child_process';
import { promisify } from 'util';
const execFileAsync = promisify(execFile);

@Injectable()
export class ExerciseService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Exercise)
    private _exerciseRepository: Repository<Exercise>,

    @InjectRepository(Muscle)
    private _muscleRepository: Repository<Muscle>,

    @InjectRepository(ExerciseLevel)
    private _exerciseLevelRepository: Repository<ExerciseLevel>,

    @InjectRepository(EvaluationCriteria)
    private _evaluationCriteria: Repository<EvaluationCriteria>,

    @InjectRepository(Position)
    private _positionRepository: Repository<Position>,

    @InjectRepository(Schedule)
    private _scheduleRepository: Repository<Schedule>,

    @InjectRepository(ScheduleDetail)
    private _scheduleDetailRepository: Repository<ScheduleDetail>,

    @InjectRepository(Joint)
    private _jointRepository: Repository<Joint>,

    @InjectRepository(Result)
    private _resultRepository: Repository<Result>,
  ) {}

  async create(payload: any) {
    console.log(payload)
    try {
      const name = String(payload?.name ?? '').trim();
      const minAge = Number(payload?.minAge);
      const maxAge = Number(payload?.maxAge);
      const calo = Number(payload?.calo);
      const muscles: any = Array.isArray(payload?.muscles)
        ? [...new Set(payload.muscles.map((x: any) => Number(x)))]
        : [];
        
      const existed = await this._exerciseRepository
        .createQueryBuilder('ex')
        .where('LOWER(ex.name) = LOWER(:name)', { name })
        .getOne();
  
      if (existed) {
        return { isSuccess: false, statusCode: 409, message: 'Tên bài tập đã tồn tại!' };
      }
  
      const saved = await this._exerciseRepository.save(
        this._exerciseRepository.create({ name, minAge, maxAge, calo })
      );
  
      await this._muscleRepository
        .createQueryBuilder()
        .insert()
        .into(Muscle)
        .values(muscles.map((gid: number) => ({
          id: gid,  
          exerciseID: saved.id,  
        })))
        .execute();

      await this._positionRepository.save(
        [
          { exerciseID: saved.id, name: 'Label 01', order: 0, },
          { exerciseID: saved.id, name: 'Label 02', order: 1, },
          { exerciseID: saved.id, name: 'Label 03', order: 2, },
        ],
      )
  
      return {
        isSuccess: true,
        statusCode: 201,
        message: 'Tạo bài tập thành công!',
        data: { id: saved.id, name: saved.name, minAge: saved.minAge, maxAge: saved.maxAge, calo: saved.calo },
      };
    } catch (e) {
      console.log(e)
      return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
    }
  }
  

  async findAll(payload: any) {
    try {
      const name = String(payload?.name ?? '').trim();
      const gid =
        payload?.muscleGroupId !== undefined &&
        payload?.muscleGroupId !== null &&
        payload?.muscleGroupId !== ''
          ? Number(payload.muscleGroupId)
          : NaN;
  
      const qb = this._exerciseRepository.createQueryBuilder('ex');
      if (!Number.isNaN(gid)) qb.innerJoin('ex.muscles', 'm');
  
      const clauses: string[] = [];
      const params: any = {};
      if (name) { clauses.push('ex.name LIKE :name'); params.name = `%${name}%`; }
      if (!Number.isNaN(gid)) { clauses.push('m.groupId = :gid'); params.gid = gid; }
  
      qb.where(clauses.length ? clauses.join(' AND ') : '1=1')
        .orderBy('ex.id', 'ASC');
  
      const data = await qb.getMany();
  
      return { isSuccess: true, statusCode: 200, message: 'Lấy danh sách bài tập thành công', data };
    } catch {
      return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
    }
  }
  
  async findOne(payload: any) {
    try {
      const exercise = await this._exerciseRepository.findOne({
        where: { id: payload.id },
        relations: {
          levels: true,
          muscles: true,
          positions: { evaluationCriteria: {joints: true} },
        },
        order:{
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
      if (!exercise) return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };
      return { isSuccess: true, statusCode: 200, message: 'Tìm thành công', data: exercise };
    } catch (e) {
      return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
    }
  }
  
  async delete(payload: any) {
    try {
      const exercise = await this._exerciseRepository.findOne({ where: { id: payload.id } });
      if (!exercise) return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };

      const abs = path.join(process.cwd(), 'uploads', String(payload.id)); 
      if (fs.existsSync(abs)) fs.rmSync(abs, { recursive: true, force: true });
  
      await this._exerciseRepository.remove(exercise);
      return { isSuccess: true, statusCode: 200, message: 'Xóa bài tập thành công!' };
    } catch (e) {
      return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
    }
  }

  async updateInfo(payload: any) {
    try {
      const id = Number(payload?.id);
      if (!id) return { isSuccess: false, statusCode: 400, message: 'Thiếu id!' };
  
      const exercise = await this._exerciseRepository.findOne({ where: { id } });
      if (!exercise) return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };
  
      if (typeof payload.name === 'string') {
        const name = payload.name.trim();
        if (name && name.toLowerCase() !== (exercise.name ?? '').toLowerCase()) {
          const existed = await this._exerciseRepository
            .createQueryBuilder('ex')
            .where('LOWER(ex.name) = LOWER(:name)', { name })
            .andWhere('ex.id <> :id', { id })
            .getOne();
          if (existed) return { isSuccess: false, statusCode: 409, message: 'Tên bài tập đã tồn tại!' };
          exercise.name = name;
        }
      }
      if (payload.minAge !== undefined) exercise.minAge = Number(payload.minAge);
      if (payload.maxAge !== undefined) exercise.maxAge = Number(payload.maxAge);
      if (payload.calo   !== undefined) exercise.calo   = Number(payload.calo);
      await this._exerciseRepository.save(exercise);

      if (Array.isArray(payload.muscles)) {
        const rows = (payload.muscles || [])
          .map((v: any) => Number(v))
          .filter((n) => Number.isInteger(n))
          .map((gid) => ({ exerciseID: id, id: gid }));

        await this._muscleRepository.createQueryBuilder().delete().from(Muscle).where('exerciseID = :id', { id }).execute();
        if (rows.length) await this._muscleRepository.createQueryBuilder().insert().into(Muscle).values(rows).execute();
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
    } catch (error) {
      return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
    }
  }

  async updateLevel(payload: any) {
    try {
      const exercise = await this._exerciseRepository.findOne({ where: { id: payload.id } });
      if (!exercise) return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };
  
      await this._exerciseLevelRepository.delete({ exercise: { id: payload.id } });
  
      const levels = Array.isArray(payload.levels) ? payload.levels : [];
      if (levels.length) {
        const rows = levels.map((l: any, index: number) => ({
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
    } catch (e){
      return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
    }
  }
  
  async updateCriteria(payload: any) {
    try {
      const id = Number(payload?.id);
      const exercise = await this._exerciseRepository.findOne({ where: { id }, relations: ['positions.evaluationCriteria'] });
      if (!exercise) return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };
  
      await this._evaluationCriteria.delete({ position: { id: payload.positionID } });

      const jointList: any = []
  
      const criteria = (payload.criteria || []).map((c: any) => ({
        positionID: payload.positionID,
        operator: c.operator,
        angle: c.angle,
        errorMessage: c.message,
      }));
      const criteriaResult = await this._evaluationCriteria.save(criteria);
      criteriaResult.forEach((c: any, index: any) => {

        payload.criteria[index].jointAngle.map((data: any, i: number)=>{
          const j = new Joint()
          j.evaluationCriteriaID = c.id
          j.id = data
          j.order = i
          jointList.push(j)
        })
      });

      await this._jointRepository.save(jointList)

      const voices = 'voices';
      const dir = path.join(process.cwd(), 'uploads', 'exercise', String(id));
      const voiceDir = path.join(dir, voices);
      fs.mkdirSync(voiceDir, { recursive: true });

      // Xóa tất cả file âm thanh cũ
      const position = exercise!.positions.find((position: any)=>(position.id === payload.positionID))
      const abs = path.join(process.cwd(), 'uploads', 'exercise', String(payload.id), 'voices'); 
      if (fs.existsSync(abs)) {
        position?.evaluationCriteria.map((criteria: any)=>{
          const filePath = path.join(abs, String(payload.positionID) + '-' + String(criteria.id)+ '.wav')
          if(fs.existsSync(filePath))
            fs.unlinkSync(filePath);
        })
      }
      else{
        fs.mkdirSync(abs, { recursive: true })
      }
  
      for (const c of criteriaResult) {
        const msg = String(c?.errorMessage || '').trim();
        if (!msg) continue;
        const outPath = path.join(voiceDir, `${payload.positionID}-${c.id}.wav`);
        await this.convertTextToSpeech(msg, outPath);
      }
  
      return { isSuccess: true, statusCode: 200, message: 'Cập nhật tiêu chí thành công' };
    } catch (e) {
      console.log(e)
      return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
    }
  }  

  async updateModel(payload: any) {
    try {
      const id = Number(payload?.id);
      if (!id) return { isSuccess: false, statusCode: 400, message: 'Thiếu id!' };

      const exercise = await this._exerciseRepository.findOne({ where: { id } });
      if (!exercise) return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };

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

      if (payload?.accuracy !== undefined) exercise.lastTrainResult = Number(payload.accuracy);

      await this._exerciseRepository.save(exercise);

      const positionNames = Object.entries(JSON.parse(payload.labels)).map(([exerciseID, name]) => ({
        exerciseID: Number(exerciseID),
        name: name
      }))

      for (const [index, pos] of positionNames.entries()) {
        const existingPos = new Position()
        existingPos.id = pos.exerciseID
        existingPos.exerciseID = id
        existingPos.name = pos.name as string
        existingPos.order = index
        
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
    } catch (e) {
      return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
    }
  }

  private async convertTextToSpeech(text: string, destWav: string): Promise<void> {
    // Các thư mục chứa tệp pipertts
    const candidateSrcDirs = [
      path.join(process.cwd(), 'pipertts'),
      path.join(__dirname, '..', '..', 'pipertts'),
      path.join(__dirname, 'pipertts'),
    ];
    const srcRoot = candidateSrcDirs.find(p => fs.existsSync(p));
    if (!srcRoot) {
      throw new Error(`[TTS] Không tìm thấy thư mục 'pipertts' ở các vị trí:\n- ${candidateSrcDirs.join('\n- ')}`);
    }

    // Chuẩn bị các tệp cần thiết
    const work = path.join(os.tmpdir(), 'piper-work');
    const bin = path.join(work, process.platform === 'win32' ? 'piper.exe' : 'piper');
    const model = path.join(work, 'vi_VN-vais1000-medium.onnx');
    const cfg = path.join(work, 'vi_VN-vais1000-medium.onnx.json');
    const esDir = path.join(work, 'espeak-ng-data');

    // Hàm kiểm tra đủ thành phần
    const isReady = () =>
      fs.existsSync(bin) &&
      fs.existsSync(model) &&
      fs.existsSync(cfg) &&
      fs.existsSync(esDir);

    // Nếu thiếu thì copy lại từ pipertts
    if (!isReady()) {
      try { fs.rmSync(work, { recursive: true, force: true }); } catch {}
      fs.cpSync(srcRoot, work, { recursive: true });
      try {
        if (process.platform !== 'win32' && fs.existsSync(bin)) fs.chmodSync(bin, 0o755);
      } catch {}
    }

    // Kiểm tra lần cuối
    if (!isReady()) {
      throw new Error(`[TTS] Không thể chuẩn bị Piper runtime trong ${work}`);
    }

    // Tạo tệp tạm để lưu kết quả âm thanh
    const tmpOut = path.join(work, `out-${Date.now()}-${Math.random().toString(36).slice(2)}.wav`);

    // Hàm xử lý văn bản trước khi truyền vào Piper
    const processTextWithPauses = (inputText: string): string => {
      return inputText
        .replace(/([,\.!])/g, '$1<pause>')  // Thêm khoảng dừng sau dấu câu
        .replace(/\<pause\>/g, '  ');  // Thay thế bằng khoảng trắng dài (hoặc ký tự khác nếu cần)
    };

    const processedText = processTextWithPauses(text);

    // Gọi Piper để chuyển văn bản thành âm thanh
    await new Promise<void>((resolve, reject) => {
      const p = spawn(
        bin,
        ['--model', path.basename(model), '--config', path.basename(cfg), '--output_file', path.basename(tmpOut)],
        {
          cwd: work,
          env: { ...process.env, ESPEAKNG_DATA_PATH: esDir },
          stdio: ['pipe', 'pipe', 'pipe'],
          windowsHide: true,
        }
      );

      let err = '';
      p.stderr.on('data', d => { err += d.toString(); });
      p.on('error', reject);
      p.on('close', code => code === 0 ? resolve() : reject(new Error(`[TTS] Piper exit ${code}${err ? `\n${err}` : ''}`)));

      p.stdin.end(processedText.trim() + '\n', 'utf8');
    });

    // Lưu kết quả vào tệp đích
    fs.mkdirSync(path.dirname(destWav), { recursive: true });
    fs.copyFileSync(tmpOut, destWav);
  }
  
  async getExercise(payload: any) {
    try {
      const date = String(payload?.date ?? '').trim();
      const userId = Number(payload?.userId);
      if (!date) return { isSuccess: false, statusCode: 400, message: 'Thiếu ngày.' };
  
      const schedule = await this._scheduleRepository.findOne({
        where: { traineeID: userId, isTraining: 1 },
        relations: ['details', 'details.exercise'],
      })!;
  
      const details = (schedule!.details || []).filter((x: any) => String(x.date) === date);
      const data: any[] = [];
      for (const d of details) {
        const ex = await this._exerciseRepository.findOne({
          where: { id: d.exerciseID },
          relations: ['positions', 'positions.evaluationCriteria', 'positions.evaluationCriteria.joints'],
        });
        if (!ex) return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };
  
        const level = await this._exerciseLevelRepository.findOne({ where: { exerciseID: ex.id, level: schedule!.level } });
  
        const dir = path.join(process.cwd(), 'uploads', 'exercise', String(ex.id));
        const modelPath = path.join(dir, 'model.json');
        const weightsPath = path.join(dir, 'model.weights.bin');
        const fbxPath = path.join(dir, 'instruction.fbx');
        const voicePaths = path.join(dir, 'voices');
        let voiceFiles: any = []
        fs.readdir(voicePaths, 
          { withFileTypes: true },
          (err, files: any) => {
            if(!err)
              files.forEach(file => {
                voiceFiles.push(path.join('uploads', 'exercise', String(ex.id), 'voices', file.name));
              })
        })

        const positions = (ex.positions || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          evaluationCriteria: (p.evaluationCriteria || []).map((c: any) => ({
            id: c.id,
            positionID: p.id,
            operator: c.operator,
            angle: c.angle,
            errorMessage: c.errorMessage,
            joints: (c.joints || []).map((j: any) => j.id),
          })),
        }));
  
        data.push({
          id: ex.id,
          name: ex.name,
          set: level?.set ?? 0,
          rep: level?.rep ?? 0,
          calo: (ex.calo * level!.set * level!.rep).toFixed(1),
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
    } catch (e) {
      return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
    }
  }

  async saveStats(payload: any) {
    try {
      const items: any[] = Array.isArray(payload.errors) ? payload.errors : [];
  
      const resultRepo = this.dataSource.getRepository(Result);
      const jointListRepo = this.dataSource.getRepository(JointList);

  
      const savedResultIDs: number[] = [];

      const scheduleDetailList = await this._scheduleDetailRepository.find(
        { 
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
        }
      );
      
      for (const scheduleDetail of scheduleDetailList){
          //Đánh dấu là đã tập
          scheduleDetail.isTrained = 1;
          await this._scheduleDetailRepository.save(scheduleDetail);

          // Xóa tất cả các result trước đó
          await this._resultRepository.remove(scheduleDetail.results)
      }
  
      for (const raw of items) {
        const scheduleDetailID = Number(raw?.scheduleDetailID);
        const set = Number(raw?.set);
        const rep = Number(raw?.rep);
        const positionName = String(raw?.positionName ?? '').trim();
        const actualAngle = Number(raw?.actualAngle);
        const errorMessage = String(raw?.errorMessage ?? '').trim();
  
        const jointList: any[] = Array.isArray(raw?.jointList)
          ? [...new Set(raw.jointList.map((x: any) => Number(x)).filter((x: number) => !isNaN(x)))]
          : [];
  
        const saved = await resultRepo.save(
          resultRepo.create({
            scheduleDetailID,
            set,
            rep,
            positionName,
            actualAngle,
            errorMessage,
          })
        );
  
        if (jointList.length > 0) {
          await jointListRepo
            .createQueryBuilder()
            .insert()
            .into(JointList)
            .values(jointList.map((jid: number, index: number) => ({
              id: jid,            // jointID
              resultID: saved.id, // gắn với result vừa lưu
              order: index
            })))
            .execute();
        }
  
        savedResultIDs.push(saved.id);
      }
  
      return { isSuccess: true, statusCode: 200, message: 'Lưu thành công'};
    } catch(e: any) {
      console.log(e)
      return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
    }
  }  

  async getExamples() {
    try {
      // Lấy nhẹ nhàng đủ thông tin
      const rows = await this._exerciseRepository.find({
        select: ['id', 'name'],
      });

      const data = (rows || []).map((x: any) => ({
        id: x.id,
        name: x.name,
        path: path.join(process.cwd(), 'uploads', 'exercise', String(x.id), 'instruction.fbx'),
      }));

      return { isSuccess: true, statusCode: 200, message: 'Thành công', data };
    } catch {
      return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
    }
  }
  
}
