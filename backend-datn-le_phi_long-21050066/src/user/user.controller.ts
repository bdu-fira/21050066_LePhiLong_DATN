import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Headers, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDTO } from './dto/login.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly _userService: UserService,
    private readonly _configService: ConfigService
  ) {}

  @Post('login')
  async login(@Body() payload: LoginDTO, @Res() res: Response) {
      const result = await this._userService.login(payload)

      if (result.isSuccess && result.data) {
          // Set cookie cho access_token
          res.cookie('access_token', result.data.access_token, {
              httpOnly: true,
              secure: this._configService.get<string>('NODE_ENV') === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 15 * 60 * 1000 // 15 phút
          })

          // Set cookie cho refresh_token
          res.cookie('refresh_token', result.data.refresh_token, {
              httpOnly: true,
              secure: this._configService.get<string>('NODE_ENV') === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày,
          })
      }

      res.status(result.statusCode).json(result)
  }

  @UseGuards(AuthGuard([]))
  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: this._configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this._configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });
    return res.json({ message: 'Đã đăng xuất và xóa cookie!' });
  }

  @UseGuards(AuthGuard([]))
  @Post('verify')
  async verify(@Res() res: Response) {
    console.log('test')
    const result = {
      isSuccess: true,
      statusCode: 200,
      message: 'Xác thực thành công!',
    }
    res.status(result.statusCode).json(
      result
    );
  }

  @UseGuards(AuthGuard)
  @Post('create')
  async create(@Body() payload: any, @Res() res: Response) {
    const result = await this._userService.create(payload);
    res.status(result.statusCode).json(
      result
    );
  }

  @UseGuards(AuthGuard)
  @Get('findAll')
  async findAll(@Query() payload: any, @Res() res: Response) {
    const result = await this._userService.findAll(payload);
    res.status(result.statusCode).json(
      result
    );
  }

  @UseGuards(AuthGuard([1, 0]))
  @Get('/findOne')
  async findOne(@Query() payload: any, @Res() res: Response) {
    const result = await this._userService.findOne(payload);
    res.status(result.statusCode).json(
      result
    );
  }

  @UseGuards(AuthGuard([1, 0]))
  @Patch('update')
  async update(@Body() payload: any, @Req() req: any, @Res() res: Response) {
    const result = await this._userService.update(payload);
    res.status(result.statusCode).json(
      result
    );
  }

  @UseGuards(AuthGuard)
  @Delete('delete')
  async remove(@Query() payload: any) {
    return this._userService.delete(payload);
  }
}
