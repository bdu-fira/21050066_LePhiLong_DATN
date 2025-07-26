import { Injectable } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private _userRepository: Repository<User>,
    private _jwtService: JwtService,
    private _configService: ConfigService
  ) { }
  async login(payload: LoginDTO) {
    try {
      const user = await this._userRepository.findOne({
        where: {
          email: payload.email
        }
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
      const user = this._userRepository.findOne({
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

      if (payload.hasOwnProperty('password')){
        payload.password = await bcrypt.hash(payload.password, parseInt(this._configService.get('BCRYPT_ROUNDS') as string))
      }
      Object.assign(user, payload)

      const result = await this._userRepository.save(user)

      return {
        isSuccess: true,
        statusCode: 200,
        message: 'Cập nhật thành công!'
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
}
