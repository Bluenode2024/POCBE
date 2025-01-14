import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { SignInDto, RegisterDto } from './dto/auth.dto';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

export enum UserStatus {
  DORMANT = 'dormant',
  ACTIVE = 'active',
  WITHDRAWN = 'withdrawn',
  INACTIVE = 'inactive',
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateSignature(signInDto: SignInDto): Promise<boolean> {
    try {
      if (this.configService.get('NODE_ENV') === 'development') {
        return true;
      }
      const recoveredAddress = ethers.verifyMessage(
        signInDto.message,
        signInDto.signature,
      );
      return (
        recoveredAddress.toLowerCase() === signInDto.walletAddress.toLowerCase()
      );
    } catch {
      return false;
    }
  }

  async register(registerDto: RegisterDto) {
    // 지갑 주소 중복 확인
    const { data: existingWallet } = await this.supabase
      .from('users')
      .select('wallet_address')
      .eq('wallet_address', registerDto.walletAddress)
      .single();

    if (existingWallet) {
      throw new ConflictException('Wallet address already registered');
    }

    // 학번 중복 확인
    const { data: existingStudentId } = await this.supabase
      .from('users')
      .select('student_id')
      .eq('student_id', registerDto.studentId)
      .single();

    if (existingStudentId) {
      throw new ConflictException('Student ID already registered');
    }

    // 새 사용자 등록
    const { data, error } = await this.supabase
      .from('users')
      .insert([
        {
          username: registerDto.username,
          department: registerDto.department,
          student_id: registerDto.studentId,
          wallet_address: registerDto.walletAddress,
          status: UserStatus.DORMANT,
          request_status: RequestStatus.PENDING,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    }

    return {
      message: 'Registration successful. Awaiting admin approval.',
      user: data,
    };
  }

  async signIn(signInDto: SignInDto) {
    const isValid = await this.validateSignature(signInDto);
    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('wallet_address', signInDto.walletAddress)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    // 계정 상태 확인
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Account is not active. Please contact admin.',
      );
    }

    // admin_roles 확인
    const { data: adminRole, error: adminError } = await this.supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('granted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (adminError && adminError.code !== 'PGRST116') {
      console.error('Admin role check error:', adminError);
    }

    try {
      const payload = {
        sub: signInDto.walletAddress,
        message: signInDto.message,
        userId: user.id,
        isAdmin: !!adminRole,
        roles: adminRole ? ['admin'] : ['user'],
        status: user.status,
      };

      const secret = this.configService.get('JWT_SECRET_KEY');
      const token = await this.jwtService.signAsync(payload, {
        secret: secret,
      });

      return {
        access_token: token,
        user: {
          ...user,
          isAdmin: !!adminRole,
          roles: adminRole ? ['admin'] : ['user'],
        },
      };
    } catch (error) {
      console.error('Token generation error:', error);
      throw new Error('Token generation failed');
    }
  }
}
