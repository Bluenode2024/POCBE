// src/auth/auth.service.ts
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { SignInDto, RegisterDto } from './dto/auth.dto';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private jwtService: JwtService,
  ) {}

  async validateSignature(signInDto: SignInDto): Promise<boolean> {
    try {
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

    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('wallet_address', signInDto.walletAddress)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = {
      sub: user.id,
      walletAddress: user.wallet_address,
      role: user.registration_status,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user,
    };
  }

  async register(registerDto: RegisterDto) {
    const { data: existingUser } = await this.supabase
      .from('users')
      .select('*')
      .eq('wallet_address', registerDto.walletAddress)
      .single();

    if (existingUser) {
      throw new UnauthorizedException('Wallet address already registered');
    }

    const { data, error } = await this.supabase
      .from('users')
      .insert([
        {
          username: registerDto.username,
          full_name: registerDto.fullName,
          department: registerDto.department,
          wallet_address: registerDto.walletAddress,
          student_id: registerDto.studentId,
          registration_status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
