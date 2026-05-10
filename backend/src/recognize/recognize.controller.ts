import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecognizeService } from './recognize.service';

@Controller('api/recognize')
export class RecognizeController {
  constructor(private readonly recognizeService: RecognizeService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async recognize(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('请上传图片文件');
    }
    return this.recognizeService.recognize(file.buffer);
  }
}
