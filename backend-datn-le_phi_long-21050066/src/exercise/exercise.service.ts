import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import { Exercise } from 'src/entities/exercise.entity';
import { Muscle } from 'src/entities/muscle.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { ExerciseLevel } from 'src/entities/exerciselevel.entity';
import { EvaluationCriteria } from 'src/entities/evaluationcriteria.entity';
import { Position } from 'src/entities/position.entity';
import { Joint } from 'src/entities/joint.entity';

@Injectable()
export class ExerciseService {
  constructor(
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

    @InjectRepository(Joint)
    private _joint: Repository<Joint>,
  ) {}

  async create(payload: any) {
    try {
      const name = String(payload?.name ?? '').trim();
      const minAge = Number(payload?.minAge);
      const maxAge = Number(payload?.maxAge);
      const calo = Number(payload?.calo);
      const muscles: any = Array.isArray(payload?.muscles)
        ? [...new Set(payload.muscles.map((x: any) => Number(x)))]
        : [];
      
      console.log('Creating exercise with payload:', payload);
  
      // Kiểm tra trùng tên (case-insensitive)
      const existed = await this._exerciseRepository
        .createQueryBuilder('ex')
        .where('LOWER(ex.name) = LOWER(:name)', { name })
        .getOne();
  
      if (existed) {
        return { isSuccess: false, statusCode: 409, message: 'Tên bài tập đã tồn tại!' };
      }
  
      // Tạo bài tập
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

      // Tạo từng dòng position
      await this._positionRepository.save(
        [
          {
            exerciseID: saved.id,
            name: 'Label 01',
          },
          {
            exerciseID: saved.id,
            name: 'Label 02',
          },
          {
            exerciseID: saved.id,
            name: 'Label 03',
          },
        ],
      )
  
      return {
        isSuccess: true,
        statusCode: 201,
        message: 'Tạo bài tập thành công!',
        data: { id: saved.id, name: saved.name, minAge: saved.minAge, maxAge: saved.maxAge, calo: saved.calo },
      };
    } catch (e) {
      console.log(e);
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
  
      // Join chỉ khi cần lọc theo nhóm cơ
      if (!Number.isNaN(gid)) {
        qb.innerJoin('ex.muscles', 'm'); // dùng để filter
      }
  
      const clauses: string[] = [];
      const params: any = {};
  
      if (name) {
        clauses.push('ex.name LIKE :name');
        params.name = `%${name}%`;
      }
      if (!Number.isNaN(gid)) {
        clauses.push('m.groupId = :gid'); // nếu cột là m.id thì đổi thành 'm.id = :gid'
        params.gid = gid;
      }
  
      qb.where(clauses.length ? clauses.join(' AND ') : '1=1')
        .orderBy('ex.id', 'ASC');
  
      const data = await qb.getMany();
  
      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Lấy danh sách bài tập thành công',
        data,
      };
    } catch {
      return {
        isSuccess: false,
        statusCode: 500,
        message: 'Lỗi hệ thống, vui lòng thử lại sau.',
      };
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
      });
  
      if (!exercise) {
        return {
          isSuccess: false,
          statusCode: 404,
          message: 'Bài tập không tồn tại!',
        };
      }
  
      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Tìm thành công',
        data: exercise,
      };
    } catch (e) {
      return {
        isSuccess: false,
        statusCode: 500,
        message: 'Lỗi hệ thống, vui lòng thử lại sau.',
      };
    }
  }
  

  async delete(payload: any) {
    try {
      const exercise = await this._exerciseRepository.findOne({
        where: { id: payload.id }
      });
  
      if (!exercise) {
        return {
          isSuccess: false,
          statusCode: 404,
          message: 'Bài tập không tồn tại!'
        };
      }

      const abs = path.join(process.cwd(), 'uploads', String(payload.id)); 

      if (fs.existsSync(abs)) {
        fs.rmSync(abs, { recursive: true, force: true });
      }
  
      await this._exerciseRepository.remove(exercise);
  
      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Xóa bài tập thành công!'
      };
    } catch (e) {
      console.log(e)
      return {
        isSuccess: false,
        statusCode: 500,
        message: 'Lỗi hệ thống, vui lòng thử lại sau.',
      };
    }
  }

  async updateInfo(payload: any) {
    try {
      const id = Number(payload?.id);
      if (!id) {
        return { isSuccess: false, statusCode: 400, message: 'Thiếu id!' };
      }

      console.log(payload)
  
      const exercise = await this._exerciseRepository.findOne({ where: { id } });
      if (!exercise) {
        return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };
      }
  
      if (typeof payload.name === 'string') {
        const name = payload.name.trim();
        if (name && name.toLowerCase() !== (exercise.name ?? '').toLowerCase()) {
          const existed = await this._exerciseRepository
            .createQueryBuilder('ex')
            .where('LOWER(ex.name) = LOWER(:name)', { name })
            .andWhere('ex.id <> :id', { id })
            .getOne();
  
          if (existed) {
            return { isSuccess: false, statusCode: 409, message: 'Tên bài tập đã tồn tại!' };
          }
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

        await this._muscleRepository
          .createQueryBuilder()
          .delete()
          .from(Muscle)
          .where('exerciseID = :id', { id })
          .execute();
  
        if (rows.length) {
          await this._muscleRepository
            .createQueryBuilder()
            .insert()
            .into(Muscle)
            .values(rows)
            .execute();
        }
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
        data: {
          id: exercise.id,
          name: exercise.name,
          minAge: exercise.minAge,
          maxAge: exercise.maxAge,
          calo: exercise.calo,
        },
      };
    } catch (error) {
      return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
    }
  }

  async updateLevel(payload: any) {
    try {
      const exercise = await this._exerciseRepository.findOne({
        where: { id: payload.id },
      });
  
      if (!exercise) {
        return {
          isSuccess: false,
          statusCode: 404,
          message: 'Bài tập không tồn tại!',
        };
      }
  
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
  
      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Cập nhật level thành công',
        data,
      };
    } catch (e){
      console.log(e)
      return {
        isSuccess: false,
        statusCode: 500,
        message: 'Lỗi hệ thống, vui lòng thử lại sau.',
      };
    }
  }
  
  async updateCriteria(payload: any) {
    try{
      const exercise = await this._exerciseRepository.findOne({
        where: { id: payload.id },
      });
  
      if (!exercise) {
        return {
          isSuccess: false,
          statusCode: 404,
          message: 'Bài tập không tồn tại!',
        };
      }
  
      await this._evaluationCriteria.delete({ position: { id: payload.positionID } });

      const criteria = payload.criteria.map((c: any) => ({
        positionID: payload.positionID,
        operator: c.operator,
        angle: c.angle,
        errorMessage: c.message,
      }));

      const criteriaResult = await this._evaluationCriteria.save(criteria)

      const jointList = payload.criteria.map((j: any) => ({        
        jointID: j.jointAngle
      }));

      const mappedJointList = criteriaResult.map((c: any, index: number) => ({
        evaluationCriteria: c.id,
        id: jointList[index].jointID,
      }));

      const flattenedJointList = mappedJointList.flatMap(item =>
        item.id.map((i: any) => ({ evaluationCriteriaID: item.evaluationCriteria, id: i }))
      );

      await this._joint.save(flattenedJointList);

      return{
        isSuccess: true,
        statusCode: 200,
        message: 'Cập nhật tiêu chí thành công',
      }
  
    } catch (e){
      console.log(e)
      return {
        isSuccess: false,
        statusCode: 500,
        message: 'Lỗi hệ thống, vui lòng thử lại sau.',
      };
    }
  }
  
  async updateModel(payload: any) {
    try {
      console.log(payload)
      const id = Number(payload?.id);
      if (!id) {
        return { isSuccess: false, statusCode: 400, message: 'Thiếu id!' };
      }
  
      const exercise = await this._exerciseRepository.findOne({ where: { id } });
      if (!exercise) {
        return { isSuccess: false, statusCode: 404, message: 'Bài tập không tồn tại!' };
      }
  
      if (payload?.file) {
        const dir = path.join(process.cwd(), 'uploads', 'exercise', String(id));
        fs.mkdirSync(dir, { recursive: true });
        const filePath = path.join(dir, 'model.weights');
        fs.writeFileSync(filePath, payload.file.buffer);
        exercise.path = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
        console.log('Model saved at:', exercise.path);
      }
  
      if (payload?.accuracy !== undefined) {
        exercise.lastTrainResult = Number(payload.accuracy);
      }
  
      await this._exerciseRepository.save(exercise);
  
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
      console.log(e);
      return { isSuccess: false, statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
    }
  }  

}
