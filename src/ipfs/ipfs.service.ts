import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class IPFSService implements OnModuleInit {
  private pinataApi: AxiosInstance;
  private apiKey: string;
  private apiSecret: string;
  private jwt: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.apiKey = this.configService.get<string>('PINATA_API_KEY');
    this.apiSecret = this.configService.get<string>('PINATA_API_SECRET');
    this.jwt = this.configService.get<string>('PINATA_JWT');

    if (!this.jwt) {
      throw new Error('Pinata JWT가 누락되었습니다.');
    }

    // Axios 인스턴스 생성
    this.pinataApi = axios.create({
      baseURL: 'https://api.pinata.cloud',
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
    });

    try {
      // 연결 테스트
      await this.testConnection();
      console.log('Pinata 연결 성공');
    } catch (error) {
      console.error('Pinata 초기화 오류:', error);
      throw new Error(`Pinata 초기화 실패: ${error.message}`);
    }
  }

  // 연결 테스트를 위한 메서드
  private async testConnection() {
    const response = await this.pinataApi.get('/data/testAuthentication');
    return response.data;
  }

  async uploadJson(data: any): Promise<string> {
    try {
      const response = await this.pinataApi.post('/pinning/pinJSONToIPFS', {
        pinataContent: data,
        pinataMetadata: {
          name: `PoC-${Date.now()}`,
        },
        pinataOptions: {
          cidVersion: 1,
        },
      });

      return response.data.IpfsHash;
    } catch (error) {
      throw new Error(`Pinata JSON 업로드 실패: ${error.message}`);
    }
  }

  async uploadFile(file: Buffer, filename: string): Promise<string> {
    try {
      const formData = new FormData();
      
      // Buffer를 직접 추가
      formData.append('file', file, {
        filename,
        contentType: 'application/octet-stream',
      });

      console.log('Starting file upload to Pinata...'); // 디버깅용 로그
      console.log('File size:', file.length); // 파일 크기 확인

      const response = await this.pinataApi.post(
        '/pinning/pinFileToIPFS',
        formData,
        {
          timeout: 30000, // 30초 타임아웃 설정
          maxBodyLength: Infinity,
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.jwt}`,
          },
          onUploadProgress: (progressEvent) => {
            console.log('Upload progress:', progressEvent.loaded, '/', progressEvent.total);
          },
        },
      );

      console.log('Pinata response received'); // 디버깅용 로그
      return response.data.IpfsHash;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.error('Request timed out');
      }
      console.error('Upload error details:', {
        code: error.code,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(`Pinata 파일 업로드 실패: ${error.message}`);
    }
}

  async unpinFile(hash: string): Promise<void> {
    try {
      await this.pinataApi.delete(`/pinning/unpin/${hash}`);
    } catch (error) {
      throw new Error(`Pinata unpin 실패: ${error.message}`);
    }
  }

  getIpfsUrl(hash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
}
