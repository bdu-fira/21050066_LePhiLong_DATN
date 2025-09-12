import { Injectable } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { Trainee } from 'src/entities/trainee.entity';
import { Admin } from 'src/entities/admin.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private _userRepository: Repository<User>,
    @InjectRepository(Trainee)
    private _traineeRepository: Repository<Trainee>,
    @InjectRepository(Admin)
    private _adminRepository: Repository<Admin>,
    private _jwtService: JwtService,
    private _configService: ConfigService,
    private _mailerService: MailerService,
  ) { }
  async login(payload: any) {
    try {
      const user = await this._userRepository.findOne({
        where: {
          email: payload.email
        },
        relations: ['trainee'],
      })

      if (!user) {
        return {
          isSuccess: false,
          statusCode: 404,
          message: 'Người dùng không tồn tại!'
        }
      }

      const is_password_match = await bcrypt.compare(payload.password, user.password)

      if (!is_password_match) {
        return {
          isSuccess: false,
          statusCode: 401,
          message: 'Sai mật khẩu, vui lòng kiểm tra lại thông tin!'
        }
      }

      // Nếu đăng nhập thành công
      // Trả về access & refresh token
      const access_token_payload = JSON.parse(JSON.stringify(user))
      delete access_token_payload.password

      const access_token = await this._jwtService.signAsync(access_token_payload)
      const refresh_token = await this._jwtService.signAsync(access_token_payload, { expiresIn: this._configService.get<string>('JWT_REFRESH_TOKEN_EXP') })

      // Nếu người dùng là admin
      // Ghi lại IP của lần đăng nhập cuối cùng vào database

      if(user.isAdmin){
        const adminAccount = await this._adminRepository.findOne({where: {id: user.id}})
        adminAccount!.lastLoginIP = payload.ip
        await this._adminRepository.save(adminAccount as Admin)
      }
      
      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Đăng nhập thành công',
        data: {
          user: access_token_payload,
          access_token: access_token,
          refresh_token: refresh_token
        }
      }
    }
    catch (e) {
      console.log(e)
      return {
        isSuccess: false,
        statusCode: 500,
        message: 'Lỗi hệ thống, vui lòng thử lại sau!'
      }
    }
  }
  async verify(payload: any) {
    try {
      await this._jwtService.verifyAsync(payload.access_token)
      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Xác thực thành công!',
      }
    }
    catch (e) {
      return {
        isSuccess: false,
        statusCode: 401,
        message: 'Access token không hợp lệ!'
      }
    }

  }

  async generateTokens(payload: any) {
    try {
      const decoded_payload = await this._jwtService.verifyAsync(payload.refresh_token)
      delete decoded_payload.iat
      delete decoded_payload.exp

      const access_token = await this._jwtService.signAsync(decoded_payload)
      const refresh_token = await this._jwtService.signAsync(decoded_payload, { expiresIn: this._configService.get<string>('JWT_REFRESH_TOKEN_EXP') })

      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Tạo token thành công!',
        data: {
          access_token: access_token,
          refresh_token: refresh_token
        }
      }
    }
    catch (e) {
      return {
        isSuccess: false,
        statusCode: 401,
        message: 'Refresh token không hợp lệ!'
      }
    }
  }


  async create(payload: any) {
    try {
      const user = await this._userRepository.findOne({
        where: {
          email: payload.email
        }
      })

      if (user) {
        return {
          isSuccess: false,
          statusCode: 409,
          message: 'Email đã tồn tại!'
        }
      }

      if (payload.hasOwnProperty('password')){
        payload.password = await bcrypt.hash(payload.password, parseInt(this._configService.get('BCRYPT_ROUNDS') as string))
      }

      const new_user = new User()
      Object.assign(new_user, payload)

      await this._userRepository.save(new_user)
      const new_trainee = new Trainee()
      new_trainee.id = new_user.id
      await this._traineeRepository.save(new_trainee)

      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Tạo người dùng thành công!'
      }
    }
    catch (e) {
      return {
        isSuccess: false,
        statusCode: 500,
        message: 'Lỗi hệ thống, vui lòng thử lại sau.',
      }
    }
  }

  async findAll(payload: any) {
    try {
      const users = await this._userRepository.find()
      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Tìm thành công',
        data: users
      }
    }
    catch (e) {
      return {
        isSuccess: false,
        statusCode: 500,
        message: 'Lỗi hệ thống, vui lòng thử lại sau.',
      }
    }
  }

  async findOne(payload: any) {
    try {
      const user = await this._userRepository.findOne({
        where: {
          id: payload.id
        }
      })

      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Tìm thành công',
        data: user
      }
    }
    catch (e) {
      return {
        isSuccess: false,
        statusCode: 500,
        message: 'Lỗi hệ thống, vui lòng thử lại sau.',
      }
    }
  }

  async update(payload: any) {
    try {
      let user = await this._userRepository.findOne({
        where: {
          id: payload.id
        }
      })

      if (!user) {
        return {
          isSuccess: false,
          statusCode: 404,
          message: 'Người dùng không tồn tại!'
        }
      }

      const checkUserEmail = await this._userRepository.findOne({
        where: {
          email: payload.email,
          id: Not(payload.id)
        },
      })

      if (checkUserEmail) {
        return {
          isSuccess: false,
          statusCode: 409,
          message: 'Email đã tồn tại!'
        }
      }

      if (payload.hasOwnProperty('password') && payload.password !== ''){
        payload.password = await bcrypt.hash(payload.password, parseInt(this._configService.get('BCRYPT_ROUNDS') as string))
      }
      else{
        delete payload.password
      }
      Object.assign(user, payload)

      const result = await this._userRepository.save(user)
      const updated_user: any = new User()
      Object.assign(updated_user, result)
      delete updated_user.password

      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Cập nhật thành công!',
        data: updated_user
      }
    }
    catch (e) {
      return {
        isSuccess: false,
        statusCode: 500,
        message: 'Lỗi hệ thống, vui lòng thử lại sau.',
      }
    }
  }

  async delete(payload: any) {
    try {
      let user = await this._userRepository.findOne({
        where: {
          id: payload.id
        }
      })

      if (!user) {
        return {
          isSuccess: false,
          statusCode: 404,
          message: 'Người dùng không tồn tại!'
        }
      }

      await this._userRepository.remove(user)

      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Xóa thành công!'
      }
    }
    catch (e) {
      return {
        isSuccess: false,
        statusCode: 500,
        message: 'Lỗi hệ thống, vui lòng thử lại sau.',
      }
    }
  }

  async lostPassword(email: string) {
    try {
      const user = await this._userRepository.findOne({
        where: { email: email }
      });
  
      if (!user) {
        return {
          isSuccess: false,
          statusCode: 404,
          message: 'Người dùng không tồn tại!'
        }
      }
  
      const payload = { email };
      const expiresIn = this._configService.get<string>('JWT_RESET_PASSWORD_TOKEN_EXP') || '15m';
      const resetToken = await this._jwtService.signAsync(payload, { expiresIn });
  
      const resetLink = `${this._configService.get<string>('SITE_URL')}/quen-mat-khau/${resetToken}`;
      const lastReset = await this._jwtService.decode(resetToken).iat

      user.lastReset = new Date(lastReset * 1000)
      await this._userRepository.save(user)
  
      await this._mailerService.sendMail({
        to: email,
        subject: 'Khôi phục mật khẩu | AI Fitness',
        template: './reset-password.hbs',
        context: { resetLink },
      });
  
      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Đã gửi hướng dẫn khôi phục mật khẩu.',
      };
    } catch (e) {
      console.log(e)
      return {
        isSuccess: false,
        statusCode: 500,
        message: 'Lỗi hệ thống, vui lòng thử lại sau.',
      }
    }
  }

  async updatePassword(payload: any) {
    try {
      const validation = await this.validateResetToken(payload)
      if(!validation.isSuccess){
        return validation
      }

      const user = validation.data!
  
      const saltRounds = parseInt(this._configService.get('BCRYPT_ROUNDS') as string) || 10;
      user.password = await bcrypt.hash(payload.password, saltRounds);
  
      await this._userRepository.save(user);
  
      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Reset mật khẩu thành công!',
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

  async validateResetToken(payload: any) {
    try {
      // Giải mã token
      const decoded: any = await this._jwtService.verifyAsync(payload.token);
  
      const user = await this._userRepository.findOne({
        where: { email: decoded.email }
      });
  
      if (!user) {
        return {
          isSuccess: false,
          statusCode: 404,
          message: 'Người dùng không tồn tại!',
        };
      }
  
      if (!user.lastReset || user.lastReset.getTime() / 1000 > decoded.iat) {
        return {
          isSuccess: false,
          statusCode: 401,
          message: 'Token đã hết hạn!',
        };
      }
  
      // Thành công
      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Token hợp lệ!',
        data: user,
      };
    } catch (err) {
      return {
        isSuccess: false,
        statusCode: 401,
        message: 'Token không hợp lệ',
      };
    }
  }
  
  
  
}
