import { Controller, Post, Body } from '@nestjs/common';
import { IPFSService } from './ipfs.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors, UploadedFile } from '@nestjs/common';


@Controller('ipfs')
export class IPFSController {
  constructor(private readonly ipfsService: IPFSService) {}

  @Post('upload-json')
  async uploadJson(@Body() data: any) {
    const hash = await this.ipfsService.uploadJson(data);
    return {
      hash,
      url: this.ipfsService.getIpfsUrl(hash)
    };
  }

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const hash = await this.ipfsService.uploadFile(file.buffer, file.originalname);
    return {
      hash,
      url: this.ipfsService.getIpfsUrl(hash)
    };
  }
} 