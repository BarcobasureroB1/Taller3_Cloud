import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService, UploadedFile } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async upload(@UploadedFiles() files: UploadedFile[]) {
    return this.filesService.uploadFiles(files);
  }

  @Get()
  async list() {
    return this.filesService.listRecent(3);
  }

  @Get('download')
  async download(@Query('key') key: string, @Res() res: Response) {
    return this.filesService.download(key, res);
  }
}
