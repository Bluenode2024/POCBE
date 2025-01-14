// src/auth/auth.service.ts
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { SignInDto, RegisterDto } from './dto/auth.dto';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

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

  async signIn(signInDto: SignInDto) {
    const isValid = await this.validateSignature(signInDto);
    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    // 사용자 조회
    const { data: user, error } = await this.supabase
      .from('user')
      .select('*')
      .eq('wallet_address', signInDto.walletAddress)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    // admin_roles 테이블에서 가장 최근의 active한 관리자 권한 확인
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

    console.log('adminRole:', adminRole);

    try {
      const payload = {
        sub: signInDto.walletAddress,
        message: signInDto.message,
        userId: user.id,
        isAdmin: !!adminRole, // admin_roles 테이블에 레코드가 있으면 true
        roles: adminRole ? ['admin'] : ['user'],
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

  async register(registerDto: RegisterDto) {
    const { data: existingUser } = await this.supabase
      .from('user')
      .select('*')
      .eq('wallet_address', registerDto.walletAddress)
      .single();

    if (existingUser) {
      throw new UnauthorizedException('Wallet address already registered');
    }

    const { data, error } = await this.supabase
      .from('user')
      .insert([
        {
          name: registerDto.name,
          department: registerDto.department,
          wallet_address: registerDto.walletAddress,
          student_number: registerDto.studentNumber,
          request_status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
