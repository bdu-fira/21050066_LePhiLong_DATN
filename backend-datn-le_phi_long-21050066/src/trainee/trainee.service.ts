import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Trainee } from 'src/entities/trainee.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TraineeService {
    constructor(
        @InjectRepository(Trainee)
        private readonly _traineeRepository: Repository<Trainee>,

        @InjectRepository(User)
        private readonly _userRepository: Repository<User>,
    ) { }

    async create(payload: { weight: number; height: number; userId: number }) {
        try {
            const user = await this._userRepository.findOne({ where: { id: payload.userId } });
            if (!user) {
                return { 
                    isSuccess: false, 
                    statusCode: 404, 
                    message: 'User không tồn tại' 
                };
            }

            const exist = await this._traineeRepository.findOne({ where: { id: payload.userId } });
            if (exist) {
                return { 
                    isSuccess: false, 
                    statusCode: 400, 
                    message: 'User đã có thông tin trainee' 
                };
            }

            const trainee = this._traineeRepository.create({
                id: user.id,
                weight: payload.weight,
                height: payload.height,
                user: user,
            });
            await this._traineeRepository.save(trainee);

            return { 
                isSuccess: true, 
                statusCode: 201, 
                message: 'Tạo thông tin trainee thành công', 
                data: trainee 
            };
        } catch (error) {
            return { 
                isSuccess: false, 
                statusCode: 500, 
                message: 'Lỗi hệ thống' 
            };
        }
    }

    async update(payload: { weight: number; height: number; userId: number }) {
        try {
            const trainee = await this._traineeRepository.findOne({ where: { id: payload.userId } });
            if (!trainee) {
                return { 
                    isSuccess: false, 
                    statusCode: 404, 
                    message: 'Trainee không tồn tại' 
                };
            }
            trainee.weight = payload.weight;
            trainee.height = payload.height;
            await this._traineeRepository.save(trainee);
            
            if (!trainee) {
                return { 
                    isSuccess: false, 
                    statusCode: 404, 
                    message: 'Trainee không tồn tại' 
                };
            }

            const user = await this._userRepository.findOne({ where: { id: payload.userId }, relations: ['trainee'] });

            return { 
                isSuccess: true, 
                statusCode: 200, 
                message: 'Cập nhật thành công!', 
                data: user 
            };
        } catch (error) {
            return { 
                isSuccess: false, 
                statusCode: 500, 
                message: 'Lỗi hệ thống, vui lòng thử lại sau' 
            };
        }
    }
}
